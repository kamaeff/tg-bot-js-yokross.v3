# YoKross bot for telegram (ToDo List)

**This bot can sell sneakers for you**

## TODO

1. **✅ (Done) Ref programm for user in db and in bot**

   - Need to develop a referral program for the user profile
   - Function which counts 3% of the order price

2. **✅ (Fixed) Fix bug with pass size sneakers (Search sneakers -> choose brand -> paste value).**

   - Bug: if user paste /start or some commands bot search this, but it will be must fix

3. **✅ (Done) Add to users in db gender and for sneaker**

   - Need add to users table gender option (gender: femail)
   - When user choose the gender option function add_gender must update row <gender_option> if this row is empty

4. **✅ (Done) Need to develop a wright logs for bot**

5. **✅ (Fixed) Fix bug with sessions in adress**

6. **✅ (Done) Develop cycle photoloop in Profile**

7. **✅ (Fixed) Fix bug with check valid input size of shooes in filter**

8. **❌ (ToDo) Do function which must check <order_status>**

   - ```if(row[0].order_status === 'Оплачено'){return (return in current order info that order was paid)}else if(row[0].order_status === 'Доставка'){return (return track code and order status must be 'Доставка' in profile)}``` 

9. **❌ (ToDo) Must to develop new algoritm for order**

  - *For new Order must generate order_id =>* (let order_id = chat_id + Date.now())
