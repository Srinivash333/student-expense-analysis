import random
import datetime
import json
import csv
import copy
import uuid

def generate_messy_data(num_records=10000):
    # Constants
    STUDENT_IDS = [f"STU{str(i).zfill(3)}" for i in range(1, 101)]
    INCOME_CATEGORIES = ["Pocket Money", "Scholarship", "Part-time Job"]
    EXPENSE_CATEGORIES = ["Food", "Travel", "Rent", "Entertainment", "Shopping", "Bills", "Others"]
    PAYMENT_METHODS = ["Cash", "UPI", "Card", "Wallet"]
    
    # Archetypes: Saver, Balanced, Overspender
    # Dict mapping student_id to archetype
    student_archetypes = {}
    for sid in STUDENT_IDS:
        student_archetypes[sid] = random.choice(["Saver", "Balanced", "Overspender"])
        
    start_date = datetime.date(2023, 1, 1)
    end_date = datetime.date(2023, 12, 31)
    days_in_year = (end_date - start_date).days
    
    records = []
    
    # Base generation
    for sid in STUDENT_IDS:
        archetype = student_archetypes[sid]
        
        # Monthly base income
        base_income = random.randint(5000, 20000)
        
        for month in range(1, 13):
            # 1. Income (usually start of the month)
            income_date = datetime.date(2023, month, random.randint(1, 5))
            records.append({
                "student_id": sid,
                "date": income_date,
                "type": "Income",
                "category": "Pocket Money",
                "amount": float(base_income),
                "payment_method": random.choice(["UPI", "Cash"]),
                "notes": random.choice(["Monthly allowance", "Dad sent", ""]),
                "is_weekend": income_date.weekday() >= 5
            })
            
            # Optional extra income
            if random.random() < 0.2:
                records.append({
                    "student_id": sid,
                    "date": datetime.date(2023, month, random.randint(10, 28)),
                    "type": "Income",
                    "category": random.choice(["Scholarship", "Part-time Job"]),
                    "amount": float(random.randint(1000, 5000)),
                    "payment_method": "Card",
                    "notes": "",
                    "is_weekend": False
                })

            # 2. Expenses
            if archetype == "Saver":
                monthly_expense_budget = base_income * random.uniform(0.5, 0.7)
            elif archetype == "Balanced":
                monthly_expense_budget = base_income * random.uniform(0.8, 0.95)
            else: # Overspender
                monthly_expense_budget = base_income * random.uniform(1.1, 1.4)
                
            num_transactions = random.randint(20, 40)
            month_expenses = []
            for _ in range(num_transactions):
                day = random.randint(1, 28)
                t_date = datetime.date(2023, month, day)
                is_weekend = t_date.weekday() >= 5
                
                # Higher spending on weekends
                weekend_multiplier = 1.5 if is_weekend else 1.0
                # Spending spike after receiving income (days 1-7)
                spike_multiplier = 1.3 if day <= 7 else 1.0
                
                amount = random.uniform(50, 500) * weekend_multiplier * spike_multiplier
                
                # Rent is usually early in month and fixed
                cat = random.choice(EXPENSE_CATEGORIES)
                if cat == "Rent":
                    if day > 5: continue
                    amount = random.uniform(2000, 5000)
                
                month_expenses.append({
                    "student_id": sid,
                    "date": t_date,
                    "type": "Expense",
                    "category": cat,
                    "raw_amount": amount,
                    "payment_method": random.choice(PAYMENT_METHODS),
                    "notes": "weekend fun" if is_weekend and cat in ["Entertainment", "Food"] else "",
                    "is_weekend": is_weekend
                })
                
            total_raw = sum(x["raw_amount"] for x in month_expenses)
            scaling_factor = monthly_expense_budget / total_raw if total_raw > 0 else 1.0
            
            for exp in month_expenses:
                scaled_amount = exp["raw_amount"] * scaling_factor
                del exp["raw_amount"]
                exp["amount"] = round(scaled_amount, 2)
                records.append(exp)
                
    # Sort chronologically just in case
    records.sort(key=lambda x: x["date"])
    
    # Cap to requested num_records
    if len(records) > num_records:
        records = random.sample(records, num_records)
        
    final_records = []
    
    for r in records:
        rec = copy.deepcopy(r)
        
        # Format Date Strings (Messy formats)
        date_obj = rec["date"]
        date_format_choice = random.random()
        if date_format_choice < 0.6:
            rec["date"] = date_obj.strftime("%d/%m/%Y")
        elif date_format_choice < 0.8:
            rec["date"] = date_obj.strftime("%m-%d-%Y")
        elif date_format_choice < 0.95:
            rec["date"] = date_obj.strftime("%Y/%m/%d")
        else:
            # Invalid/mixed format
            rec["date"] = date_obj.strftime("%Y-%d-%m") # Incorrect format logically but valid string

        del rec["is_weekend"]
        
        # Introduce Messiness
        mess_factor = random.random()
        
        # Missing values (5%)
        if mess_factor < 0.05:
            field_to_blank = random.choice(["category", "payment_method", "amount", "date"])
            rec[field_to_blank] = None
            
        # Inconsistent category naming (10%)
        if mess_factor > 0.05 and mess_factor < 0.15:
            if rec["category"]:
                c = random.random()
                if c < 0.3:
                    rec["category"] = rec["category"].upper()
                elif c < 0.6:
                    rec["category"] = rec["category"].lower()
                else:
                    if rec["category"] == "Food": rec["category"] = "fooding"
                    elif rec["category"] == "Pocket Money": rec["category"] = "allowance"
        
        # Outliers / Incorrect amounts (2%)
        if mess_factor > 0.15 and mess_factor < 0.17:
            outlier_type = random.random()
            if outlier_type < 0.3:
                rec["amount"] = 0.0
            elif outlier_type < 0.6:
                rec["amount"] = random.choice([1.0, -500.0, -100.0]) # Negative or 1
            else:
                rec["amount"] = 55000.0 # Huge outlier
                
        # Random noisy text in notes (5%)
        if mess_factor > 0.17 and mess_factor < 0.22:
            rec["notes"] = random.choice(["asdfgasdg", "???", "idk", "test data 123"])
            
        final_records.append(rec)
        
        # Duplicate records (2%)
        if random.random() < 0.02:
            dup_rec = copy.deepcopy(rec)
            final_records.append(dup_rec)
            
    # Calculate Balance
    # To do this simply, we iterate and maintain a running balance for each student
    # Note: Because of duplicates and missing amounts, the balance calculation will also be a bit messy,
    # which adds to the realism of dirty data.
    balances = {sid: 0.0 for sid in STUDENT_IDS}
    for r in final_records:
        sid = r["student_id"]
        amt = r.get("amount") or 0.0
        try:
            amt = float(amt)
        except:
            amt = 0.0
            
        if r.get("type") == "Income":
            balances[sid] += amt
        elif r.get("type") == "Expense":
            balances[sid] -= amt
            
        r["balance"] = round(balances[sid], 2)
        
    return final_records

if __name__ == "__main__":
    print("Generating dataset...")
    data = generate_messy_data(8000) # Target around 8000 + duplicates
    
    # Save to JSON
    json_path = "student_transactions.json"
    with open(json_path, "w") as f:
        json.dump(data, f, indent=4)
        
    # Save to CSV
    csv_path = "student_transactions.csv"
    if len(data) > 0:
        keys = ["student_id", "date", "type", "category", "amount", "payment_method", "balance", "notes"]
        with open(csv_path, "w", newline='') as f:
            writer = csv.DictWriter(f, fieldnames=keys)
            writer.writeheader()
            for row in data:
                # Ensure all keys exist in row, mostly they do
                safe_row = {k: row.get(k, "") for k in keys}
                writer.writerow(safe_row)
                
    print(f"Successfully generated {len(data)} records.")
    print(f"Saved to {json_path} and {csv_path}.")
