import sys
import json
from pymongo import MongoClient
import pandas as pd
from sklearn.linear_model import LinearRegression
from sklearn.tree import DecisionTreeClassifier
import numpy as np

def get_db():
    client = MongoClient('mongodb://localhost:27017/')
    return client['student_finance_db']

def predict_expense(student_id):
    db = get_db()
    
    # Aggregate monthly expenses for the student
    pipeline = [
        { "$match": { "student_id": student_id, "type": "Expense" } },
        { "$group": {
            "_id": { "year": { "$year": "$date" }, "month": { "$month": "$date" } },
            "total_expense": { "$sum": "$amount" }
        }},
        { "$sort": { "_id.year": 1, "_id.month": 1 } }
    ]
    
    expenses = list(db.cleantransactions.aggregate(pipeline))
    
    if len(expenses) < 2:
        return {"error": "Not enough data to predict"}
        
    df = pd.DataFrame(expenses)
    df['month_index'] = range(1, len(df) + 1)
    df['total_expense'] = df['total_expense'].astype(float)
    
    X = df[['month_index']]
    y = df['total_expense']
    
    model = LinearRegression()
    model.fit(X, y)
    
    next_month_index = len(df) + 1
    predicted_expense = model.predict(pd.DataFrame([[next_month_index]], columns=['month_index']))[0]
    
    return {"predicted_expense": round(predicted_expense, 2)}

def classify_student(student_id):
    db = get_db()
    
    # 1. Gather data for all students to train the model
    # (In a real app we'd train this offline and save the model, but this is fine for this scale)
    pipeline = [
        { "$group": {
            "_id": { "student_id": "$student_id", "type": "$type" },
            "total": { "$sum": "$amount" }
        }}
    ]
    
    results = list(db.cleantransactions.aggregate(pipeline))
    
    student_totals = {}
    for r in results:
        sid = r['_id']['student_id']
        t = r['_id']['type']
        if sid not in student_totals:
            student_totals[sid] = {'Income': 0, 'Expense': 0}
        student_totals[sid][t] += float(r['total'])
        
    # Prepare training data
    X = []
    y = []
    
    target_student_features = None
    
    for sid, totals in student_totals.items():
        inc = totals['Income']
        exp = totals['Expense']
        
        # Rule-based labeling for training
        if inc == 0:
            label = "Overspender" if exp > 0 else "Balanced"
        else:
            ratio = exp / inc
            if ratio < 0.75:
                label = "Saver"
            elif ratio < 0.95:
                label = "Balanced"
            else:
                label = "Overspender"
                
        features = [inc, exp]
        X.append(features)
        y.append(label)
        
        if sid == student_id:
            target_student_features = features
            
    if target_student_features is None:
        return {"error": "Student not found"}
        
    # Train Decision Tree
    clf = DecisionTreeClassifier(random_state=42)
    clf.fit(X, y)
    
    # Predict for the target student
    prediction = clf.predict([target_student_features])[0]
    
    return {"classification": prediction}

if __name__ == "__main__":
    if len(sys.argv) < 3:
        print(json.dumps({"error": "Invalid arguments"}))
        sys.exit(1)
        
    action = sys.argv[1]
    student_id = sys.argv[2]
    
    try:
        if action == "predict":
            result = predict_expense(student_id)
            print(json.dumps(result))
        elif action == "classify":
            result = classify_student(student_id)
            print(json.dumps(result))
        else:
            print(json.dumps({"error": "Unknown action"}))
    except Exception as e:
        print(json.dumps({"error": str(e)}))
