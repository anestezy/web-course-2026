$ curl.exe -s -w "\nHTTP %{http_code}\n" http://localhost:3001/categories
[{"id":1,"name":"Еда","type":"expense"},{"id":2,"name":"Транспорт","type":"expense"},{"id":3,"name":"Зарплата","type":"income"}]
HTTP 200

$ curl.exe --% -s -w "\nHTTP %{http_code}\n" -X POST http://localhost:3001/categories -H "Content-Type: application/json" -d "{\"name\":\"Развлечения\",\"type\":\"expense\"}"
{"id":4,"name":"Развлечения","type":"expense"}
HTTP 201

$ curl.exe --% -s -w "\nHTTP %{http_code}\n" -X POST http://localhost:3001/transactions -H "Content-Type: application/json" -d "{\"amount\":52000,\"category_id\":3,\"date\":\"2026-11-10\",\"comment\":\"Зарплата\"}"
{"id":1,"amount":52000,"category_id":3,"date":"2026-11-10","comment":"Зарплата","category_name":"Зарплата","category_type":"income"}
HTTP 201

$ curl.exe --% -s -w "\nHTTP %{http_code}\n" -X POST http://localhost:3001/transactions -H "Content-Type: application/json" -d "{\"amount\":350.5,\"category_id\":1,\"date\":\"2026-11-08\",\"comment\":\"Продукты\"}"
{"id":2,"amount":350.5,"category_id":1,"date":"2026-11-08","comment":"Продукты","category_name":"Еда","category_type":"expense"}
HTTP 201

$ curl.exe --% -s -w "\nHTTP %{http_code}\n" -X POST http://localhost:3001/transactions -H "Content-Type: application/json" -d "{\"amount\":-5,\"category_id\":1,\"date\":\"2026-11-10\"}"
{"error":"поле \"amount\": число больше 0"}
HTTP 400

$ curl.exe --% -s -w "\nHTTP %{http_code}\n" -X POST http://localhost:3001/transactions -H "Content-Type: application/json" -d "{\"amount\":100,\"category_id\":999,\"date\":\"2026-11-10\"}"
{"error":"Категории с id 999 не существует"}
HTTP 400

$ curl.exe -s "http://localhost:3001/transactions?type=expense"
[{"id":2,"amount":350.5,"category_id":1,"date":"2026-11-08","comment":"Продукты","category_name":"Еда","category_type":"expense"}]

$ curl.exe -s "http://localhost:3001/transactions?category_id=3&from=2026-11-01&to=2026-11-30"
[{"id":1,"amount":52000,"category_id":3,"date":"2026-11-10","comment":"Зарплата","category_name":"Зарплата","category_type":"income"}]

$ curl.exe -s "http://localhost:3001/transactions?from=2027-01-01"
[]

$ curl.exe --% -s -w "\nHTTP %{http_code}\n" -X PUT http://localhost:3001/transactions/2 -H "Content-Type: application/json" -d "{\"amount\":420,\"category_id\":1,\"date\":\"2026-11-08\",\"comment\":\"Продукты и кофе\"}"
{"id":2,"amount":420,"category_id":1,"date":"2026-11-08","comment":"Продукты и кофе","category_name":"Еда","category_type":"expense"}
HTTP 200

$ curl.exe --% -s -w "\nHTTP %{http_code}\n" -X PUT http://localhost:3001/transactions/999 -H "Content-Type: application/json" -d "{\"amount\":1,\"category_id\":1,\"date\":\"2026-11-08\"}"
{"error":"Операция с id 999 не найдена"}
HTTP 404

$ curl.exe -s -w "\nHTTP %{http_code}\n" -X DELETE http://localhost:3001/transactions/2
{"message":"Операция #2 удалена"}
HTTP 200

$ curl.exe -s -w "\nHTTP %{http_code}\n" -X DELETE http://localhost:3001/transactions/999
{"error":"Операция с id 999 не найдена"}
HTTP 404

$ curl.exe -s -w "\nHTTP %{http_code}\n" http://localhost:3001/whatever
{"error":"Маршрут GET /whatever не найден"}
HTTP 404
