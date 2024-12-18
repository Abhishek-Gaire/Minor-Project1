# Minor Project-I

## Overview

This project is a comprehensive platform designed using modern web technologies like Express.js, MongoDB, and EJS templating for rendering dynamic pages. It provides an admin dashboard to manage vehicles, users, bookings, and other administrative functionalities.

## Features

### Admin Dashboard

- **View Dashboard**: Display key metrics such as total vehicles, bookings, and user statistics.
- **Manage Vehicles**: Add, edit, delete, and update stocks of cars.
- **Manage Users**: View and manage user data.
- **Handle Bookings**: Approve, cancel, or change the status of bookings.

### Authentication

- Admin login with JWT-based authentication.
- Secure session management with HttpOnly cookies.

### File Uploads

- Support for uploading car images and 3D models.

### Error Handling

- Comprehensive error handling for invalid inputs, database issues, and file operations.

## API Endpoints

### Admin Routes

#### GET `/admin`

Redirects to the admin dashboard.

#### POST `/admin/login`

Admin login with email and password.

#### GET `/admin/cars`

View all vehicles.

#### POST `/admin/vehicles/add`

Add a new vehicle.

#### POST `/admin/vehicles/edit`

Edit an existing vehicle.

#### DELETE `/admin/vehicles/delete`

Delete a vehicle by ID.

#### GET `/admin/bookedVehicles`

View all bookings.

#### POST `/admin/bookedVehicles/status`

Update the status of a booking.

### User Routes

#### POST `/register`

Create a new user account with the provided email, username, and password.

#### POST `/login`

User login with email and password.

#### GET `/cars`

Retrieve a list of available cars for booking.

#### POST `/book`

Book a car by providing the car ID and booking details.

#### GET `/bookings`

Retrieve a list of all bookings made by the user.

## Technologies Used

- **Backend**: Node.js
- **Database**: MongoDB
- **Templating**: EJS
- **Authentication**: JWT
- **File Handling**: `fs/promises`

## Setup and Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/Abhishek-Gaire/Minor-Project1.git
   cd Minor-Project11
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Create a `.env` file and configure the following:
   ```plaintext
   PORT=3000
   MONGO_URI=your_mongo_connection_string
   JWT_SECRET=your_jwt_secret
   ```
4. Run the application:
   ```bash
   npm start
   ```
5. Visit `http://localhost:3000` to access the application.

## Contributing

Feel free to fork the repository and submit pull requests. Ensure that your code follows the existing coding standards and is properly documented.

## License

This project is licensed under the [MIT License](LICENSE).

## Contact

For any inquiries or suggestions, feel free to open an issue or contact the maintainers.
