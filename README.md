# SHOE MART

A genuine footwear store website: React on the front, PHP and MySQL behind it.

```
shoe-mart/
├── client/    React app  (npm run dev  ->  http://localhost:5173)
└── server/    PHP API    (XAMPP htdocs ->  http://localhost:8080/shoe-mart/server)
```

## Setting it up

**1. Database**
Start Apache and MySQL in XAMPP, open phpMyAdmin, go to the Import tab and import
`server/database.sql`. It creates the `shoemart` database, all the tables and sample shoes.

**2. Backend**
Copy the whole `shoe-mart` folder into `C:\xampp\htdocs\`. PHP 8.0 or newer is required.
Check `server/config/database.php` if your MySQL user is not `root` with no password.
Test it by opening `http://localhost:8080/shoe-mart/server/api/products/read.php` — you should
see JSON.

**3. Frontend**
```bash
cd client
npm install
npm run dev
```
Open http://localhost:5173

If your PHP folder sits at a different address, copy `.env.example` to `.env` and change
`VITE_API_URL`, and change `ALLOWED_ORIGIN` in `server/config/cors.php` to match the React
address.

## Admin panel

http://localhost:5173/admin — username `admin`, password `admin123`.
Change the password before the site goes anywhere real.

From there you can add, edit and delete laptops, upload photos, mark laptops as offers or
selling fast, adjust stock, move orders through their statuses and read customer messages.

## What the customer side does

- Home page with offers, selling fast, shop picks and a chooser for what the laptop is for
- Shop page with brand, budget, memory, condition and availability filters, sorting and
  pagination — every filter lives in the URL, so a filtered page can be shared as a link
- Product page with photo gallery, full spec table, delivery and warranty notes, and a
  question form that reaches the admin panel
- Compare up to three laptops side by side, with the stronger figure in each row shaded
- Cart, saved laptops, checkout with cash on delivery or bank transfer, and an order number
- Contact page, about page, WhatsApp buttons

Cart, saved laptops and the compare list are kept in the browser, so a customer does not
need an account to order.

## Notes for the demo

- Product photos: the sample rows point at files that do not exist, so a placeholder
  drawing shows instead. Upload real photos from the admin panel and they appear everywhere.
- Orders reduce stock inside a database transaction, and prices are re-read from the
  database at checkout rather than trusted from the browser.
- Admin routes are protected by a token stored in `admin_tokens`, sent as a Bearer header.

## Going live later

- Change `ALLOWED_ORIGIN` in `server/config/cors.php` to the real domain
- Change the admin password and delete `server/reset-password.php`
- Run `npm run build` in `client` and upload the `dist` folder
