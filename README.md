# barcode_generate
upload csv file and generate barcode, download as zip using Node js, Angular 10

1. Upload CSV file to the server
CSV file has 2 fields(type and value)
2. Convert it to barcode images and compressing all images to a zip file.
3. Download the zip file.

## How to run?
1. Run server
- cd server
- npm install
- npm start

server will running on http://localhost:3000
To confirm, you can run this url: http://localhost:3000/test
Then {"error_code":0,"err_desc":null,"message":"test api is working fine"} will be displayed.

2. Run client
- cd client
- npm install
- ng serve

http://localhost:4200 is running
