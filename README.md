# Legion API

The **Legion API** powers the community hub for Kimitri’s fans, providing endpoints for user interactions as well as administrative endpoints for management. It serves as the backbone for all integrations within the Legion ecosystem, ensuring connectivity and scalability.


#### Contents

- [Quick Start](#quick-start)
- [Security](#security)
- [REST APIs](#rest-apis)
    - [Authentication](#authentication)
    - [Users](#users)
- [Error Codes](#error-codes)

## Quick Start

To run the Legion API locally, make contributions, or integrate it with your application, follow the  [Contribution Guidelines](./CONTRIBUTING.md).

## Security

For information on reporting security vulnerabilities in Legion API, see
[SECURITY.md](./SECURITY.md).
  
## REST APIs

Lists API endpoints for easier integration with your application. You can call the Legion API in any language. 
>⚠We do not provide sandbox URL. If you need endpoints to assist in developing your application, follow the [Contribution Guidelines](./CONTRIBUTING.md) to run Legion API locally.

### Authentication

Legion API secures restricted routes using JWT authentication, supporting multiple authentication methods, including password-based login, One-Time password (OTP) authentication, and two-factor authentication (2FA).

<details>
 <summary><code>POST</code> <code><b>/users/login</b></code> <code>Authenticate User Password</code></summary>
 
#### Authenticate User Password
This endpoint authenticates a user by verifying their email or username along with the provided password. If the credentials match a registered user in the database, a JSON Web Token (JWT) is generated and returned to the client.

#### Request 

> #### Header Parameters 
> | name         |  required | description                                                                                          |
> |--------------|-----------|------------------------------------------------------------------------------------------------------|
> | Content-Type |  yes      | Required for operations with a request body. The value is application/. Where the 'format' is 'json'.|
> | X-CSRF-Token |  yes      | A CSRF token to protect against cross-site request forgery attacks. Must be included in the request.|

> #### Body Schema
> | name          |  type     | Required | description                         |
> |---------------|-----------|----------|-------------------------------------|
> | username      |  string   |**no**| 	The username of the user. Either `username` or `email` must be provided. |
> | email         |  string   |**no** | 	The email of the user. Either `username` or `email` must be provided.    |
> | password      |  string   |**yes** | 	The password for the user. |

#### Response 

> #### Sample Successful Response 
>
> Status Code: `200` <br>
> application/json
>```json
>{
>    "success": true,
>    "message": "User authenticated successfully!",
>    "data": {
>      "id": "01JEVAG858D9NP6A1NMTKXPRRA",
>      "name": "John Doe",
>      "username": "jhondoe123",
>      "email": "john.doe@example.com",
>      "token": {
>        "accessToken": "eyJhbGciOiJIUzI1NiIsInR...",
>        "expiresIn": "1737648644"
>        },
>    }
>}
>```

> #### Response Header Parameters 
> | name         |  value | description                                                                                          |
> |--------------|-----------|------------------------------------------------------------------------------------------------------|
> | Set-Cookie   |  refreshToken=<new_token>; Max-Age=<max_age>; Path=/users/auth/refresh; HttpOnly; Secure; SameSite=Strict     | A new `refreshToken` is issued as an HTTP-only cookie. The cookie itself expires after 27 days, while the token remains valid for 30 days.|

> #### Response Body
> application/json
>| Key         | Type     | Description                                      |
>|-------------|----------|--------------------------------------------------|
>| success     | boolean  | Indicates whether the request was successful.    |
>| message     | string   | A message providing additional context.          |
>| data        | object   | Contains the authenticated user's details and tokens.            |
>| data.id       | string   | Unique identifier for the authenticated user (ULID format).  |
>| data.name     | string   | Name for the authenticated user.                             |
>| data.email    | string   | Email for the authenticated user.                            |
>| data.username    | string   | Username for the authenticated user.                           |
>| data.token    | object   |   Contains authentication tokens and their expiry.|
>| data.token.accessToken    | string   | 	The JWT access token.                            |
>| data.token.expiresIn    | string   | 	The token expiration time (UNIX timestamp).                           |

</details>

<details>
 <summary><code>POST</code> <code><b>/users/otp/login</b></code> <code>Authenticate User with OTP (One-Time Password)</code></summary>
 
#### Authenticate User with OTP (One-Time Password)
This endpoint authenticates a user by verifying their email or username along with the OTP (One-Time Password) token provided by the user’s authenticator app (e.g., Google Authenticator, Microsoft Authenticator). If the OTP token matches the one generated by the app and passes all validation checks, a JSON Web Token (JWT) is generated and returned to the client for further authentication.

#### Request 

> #### Header Parameters 
> | name         |  required | description                                                                                          |
> |--------------|-----------|------------------------------------------------------------------------------------------------------|
> | Content-Type |  yes      | Required for operations with a request body. The value is application/. Where the 'format' is 'json'.|
> | X-CSRF-Token |  yes      | A CSRF token to protect against cross-site request forgery attacks. Must be included in the request.|

> #### Body Schema
> | name          |  type     | Required | description                         |
> |---------------|-----------|----------|-------------------------------------|
> | username      |  string   |**no**| 	The username of the user. Either `username` or `email` must be provided. |
> | email         |  string   |**no** | 	The email of the user. Either `username` or `email` must be provided.    |
> | token      |  string   |**yes** | 	The OTP code generated by the user’s authenticator app. |

#### Response 

> #### Sample Successful Response 
>
> Status Code: `200` <br>
> application/json
>```json
>{
>    "success": true,
>    "message": "User authenticated successfully!",
>    "data": {
>      "id": "01JEVAG858D9NP6A1NMTKXPRRA",
>      "name": "John Doe",
>      "username": "jhondoe123",
>      "email": "john.doe@example.com",
>      "token": {
>        "accessToken": "eyJhbGciOiJIUzI1NiIsInR...",
>        "expiresIn": "1737648644"
>        },
>    }
>}
>```

> #### Response Header Parameters 
> | name         |  value | description                                                                                          |
> |--------------|-----------|------------------------------------------------------------------------------------------------------|
> | Set-Cookie   |  refreshToken=<new_token>; Max-Age=<max_age>; Path=/users/auth/refresh; HttpOnly; Secure; SameSite=Strict     | A new `refreshToken` is issued as an HTTP-only cookie. The cookie itself expires after 27 days, while the token remains valid for 30 days.|

> #### Response Body Schema
> application/json
>| Key         | Type     | Description                                      |
>|-------------|----------|--------------------------------------------------|
>| success     | boolean  | Indicates whether the request was successful.    |
>| message     | string   | A message providing additional context.          |
>| data        | object   | Contains the authenticated user's details and tokens.            |
>| data.id       | string   | Unique identifier for the authenticated user (ULID format).  |
>| data.name     | string   | Name for the authenticated user.                             |
>| data.email    | string   | Email for the authenticated user.                            |
>| data.username    | string   | Username for the authenticated user.                           |
>| data.token    | object   |   Contains authentication tokens and their expiry.|
>| data.token.accessToken    | string   | 	The JWT access token.                            |
>| data.token.refreshToken    | string   | 	The JWT access refreshToken.                            |
>| data.token.expiresIn    | string   | 	The token expiration time (UNIX timestamp).                           |


</details>

<details>
 <summary><code>POST</code> <code><b>/users/auth/refresh</b></code> <code>Refresh User Acess Token</code></summary>
 
#### Refresh User Acess Token
This endpoint refreshes an expired access token by validating the provided refresh token. If the refresh token matches a registered token in the database and both access token and refresh token has a valid signature, a new JSON Web Token (JWT) is generated and returned to the client. Additionally, a new refresh token is issued as an HTTP-only cookie, while the previous refresh token is revoked.

#### Request 

> #### Header Parameters 
> | name         |  required | description                                                                                          |
> |--------------|-----------|------------------------------------------------------------------------------------------------------|
> | Content-Type |  yes      | Required for operations with a request body. The value is application/. Where the 'format' is 'json'.|
> | X-CSRF-Token |  yes      | A CSRF token to protect against cross-site request forgery attacks. Must be included in the request.|
> | Authorization |  yes      | Access Token, a Bearer token in the format `Bearer <JWT>` for authenticating the request and ensuring access.|

**Note**: The `refreshToken` is automatically sent by the browser in the `Cookie` header if the client has a valid session. It does not need to be manually set in the request.

#### Response 

> #### Sample Successful Response 
>
> Status Code: `200` <br>
> application/json
>```json
>{
>    "success": true,
>    "message": "Token refreshed successfully",
>    "data": {
>      "id": "01JEVAG858D9NP6A1NMTKXPRRA",
>      "name": "John Doe",
>      "username": "jhondoe123",
>      "email": "john.doe@example.com",
>      "token": {
>        "accessToken": "eyJhbGciOiJIUzI1NiIsInR...",
>        "expiresIn": "1737648644"
>        },
>    }
>}
>```

> #### Response Header Parameters 
> | name         |  value | description                                                                                          |
> |--------------|-----------|------------------------------------------------------------------------------------------------------|
> | Set-Cookie   |  refreshToken=<new_token>; Max-Age=<max_age>; Path=/users/auth/refresh; HttpOnly; Secure; SameSite=Strict     | A new `refreshToken` is issued as an HTTP-only cookie. The cookie itself expires after 27 days, while the token remains valid for 30 days.|

> #### Response Body
> application/json
>| Key         | Type     | Description                                      |
>|-------------|----------|--------------------------------------------------|
>| success     | boolean  | Indicates whether the request was successful.    |
>| message     | string   | A message providing additional context.          |
>| data        | object   | Contains the authenticated user's details and tokens.            |
>| data.id       | string   | Unique identifier for the authenticated user (ULID format).  |
>| data.name     | string   | Name for the authenticated user.                             |
>| data.email    | string   | Email for the authenticated user.                            |
>| data.username    | string   | Username for the authenticated user.                           |
>| data.token    | object   |   Contains authentication tokens and their expiry.|
>| data.token.accessToken    | string   | 	The JWT access token.                            |
>| data.token.expiresIn    | string   | 	The token expiration time (UNIX timestamp).                           |

</details>


<details>
 <summary><code>POST</code> 🔒 <code><b>/users/{userId}/otp/secret</b></code> <code>Generate One-Time Password (OTP) URL</code></summary>
 
#### Generate One-Time Password (OTP) URL
This endpoint generates a One-Time Password (OTP) authentication URL for a user. The client can use this URL to generate OTPs through an authenticator app (e.g., Google Authenticator, Microsoft Authenticator) linked to the user’s account.

#### Request 

> #### Header Parameters 
> | name         |  required | description                                                                                          |
> |--------------|-----------|------------------------------------------------------------------------------------------------------|
> | Content-Type |  yes      | Required for operations with a request body. The value is application/. Where the 'format' is 'json'.|
> | X-CSRF-Token |  yes      | A CSRF token to protect against cross-site request forgery attacks. Must be included in the request.|
> | Authorization |  yes      | A Bearer token in the format `Bearer <JWT>` for authenticating the request and ensuring access.|

#### Response 

> #### Sample Successful Response 
>
> Status Code: `200` <br>
> application/json
>```json
>{
>    "success": true,
>    "message": "Otp url generated successfully",
>    "data": {
>      "otpauthUrl": "otpauth://totp/jhondoe123?secret=LESZPGTBS5Y33CWCGYTP6CHTVETX5RRV&issuer=LegionKimitri&algorithm=SHA256&digits=6&period=30",
>    }
>}
>```


> #### Response Body Schema
> application/json
>| Key         | Type     | Description                                      |
>|-------------|----------|--------------------------------------------------|
>| success     | boolean  | Indicates whether the request was successful.    |
>| message     | string   | A message providing additional context.          |
>| data        | object   | Contains the generated OTP authentication URL.          |
>| data.otpauthUrl     | string   | The OTP URL that can be used in an authenticator app.          |


</details>

<details>
 <summary><code>PUT</code> <code><b>/users/{userId}/otp</b></code> <code>Enable One-Time Password (OTP) Authentication</code></summary>
 
#### Enable One-Time Password (OTP) Authentication
This endpoint enables One-Time Password (OTP) authentication for a user. The user must provide a valid OTP code generated by an authenticator app (e.g., Google Authenticator, Microsoft Authenticator) linked to their account.

#### Request 

> #### Header Parameters 
> | name         |  required | description                                                                                          |
> |--------------|-----------|------------------------------------------------------------------------------------------------------|
> | Content-Type |  yes      | Required for operations with a request body. The value is application/. Where the 'format' is 'json'.|
> | X-CSRF-Token |  yes      | A CSRF token to protect against cross-site request forgery attacks. Must be included in the request.|

> #### Body Schema
> | name          |  type     | Required | description                         |
> |---------------|-----------|----------|-------------------------------------|
> | token      |  string   |**yes** | 	The OTP code generated by the user’s authenticator app. |

#### Response 

> #### Sample Successful Response 
>
> Status Code: `200` <br>
> application/json
>```json
>{
>    "success": true,
>    "message": "User OTP enable successfully",
>}
>```


> #### Response Body Schema
> application/json
>| Key         | Type     | Description                                      |
>|-------------|----------|--------------------------------------------------|
>| success     | boolean  | Indicates whether the request was successful.    |
>| message     | string   | A message providing additional context.          |


</details>


### Users

<details>
 <summary><code>GET</code> <code><b>/users?page={number}</b></code> <code>List Users</code></summary>
 
#### List Users
Retrieves a paginated list of users, with 20 users per page, including detailed information for each. If the user is marked as deleted, the response return deleted status without exposing sensitive or unnecessary data.

#### Request 

> #### Header Parameters 
> | name         |  required | description                                                                                          |
> |--------------|-----------|------------------------------------------------------------------------------------------------------|
> | Content-Type |  yes      | Required for operations with a request body. The value is application/. Where the 'format' is 'json'.|
> | X-CSRF-Token |  yes      | A CSRF token to protect against cross-site request forgery attacks. Must be included in the request.|

> #### Query Parameters
> | Name | Type   | Required | Description                          |
> |------|--------|----------|--------------------------------------|
> | page   | string | **yes**  | The page number to retrieve.  |
> | includeDeleted   | string | **no**  | If set to `true`, includes data for soft-deleted users in the response. By default, only active users are retrieved.  |

#### Response 

> #### Sample Successful Response 
>
> Status Code: `200` <br>
> application/json
>```json
>{
>    "success": true,
>    "message": "Users list retrieved successfully!",
>    "data": {
>      "users": [
>           {
>               "id": "01JJ02AHX4NEFDRH5PT5KQX5MT",
>               "name": "Elaine Windler",
>               "username": "Jaylon.Stamm22",
>               "email": "Sherwood50@gmail.com",
>               "kats": 0,
>               "rank": null,
>               "isActive": true,
>               "createdAt": "2025-01-19T19:58:34.404Z"
>           },
>           {
>               "id": "01JJ0W0VM4F6DFDZWYD6P10E21",
>               "name": "Miss Luz Brakus",
>               "username": "Verlie.Dietrich66",
>               "email": "Howell.Graham61@hotmail.com",
>               "kats": 0,
>               "rank": null,
>               "isActive": true,
>               "createdAt": "2025-01-20T03:27:39.652Z"
>           },
>           ...
>       ],
>       "pagination": {
>           "totalPages": 1,
>           "totalItems": 3,
>           "isLastPage": true
>       }
>    }
>}
>```


> #### Response Body Schema
> application/json
>| Key         | Type     | Description                                      |
>|-------------|----------|--------------------------------------------------|
>| success     | boolean  | Indicates whether the request was successful.    |
>| message     | string   | A message providing additional context.          |
>| data        | object   | Contains the list of users and pagination details.            |
>| data.users[]                | array    | An array of user objects.                                                   |
>| data.users[].id             | string   | Unique identifier for the user (ULID format).                               |
>| data.users[].name           | string   | The user's full name.                                                       |
>| data.users[].username       | string   | The user's username.                                                       |
>| data.users[].email          | string   | The user's email address.                                                   |
>| data.users[].kats           | number   | Represents the amount of Legion community currency the user possesses.      |
>| data.users[].rank           | number   | The user's rank within the Legion community (null if unranked).             |
>| data.users[].isActive       | boolean  | Indicates whether the user is active.                                       |
>| data.users[].deletedAt      | string   | The date the user was deleted, or null if active.                           |
>| data.users[].restoredAt      | string   | The date the user was restored.                           |
>| data.users[].createdAt      | string   | Date when the user was created (ISO 8601 format).                           |
>| data.pagination           | object   | Pagination information for the result set.                                 |
>| data.pagination.totalPages| number   | Total number of pages available.                                            |
>| data.pagination.totalItems| number   | Total number of users available.                                           |
>| data.pagination.isLastPage| boolean  | Indicates whether the current page is the last one.                         |



</details>


<details>
 <summary><code>GET</code> <code><b>/users/{userId}</b></code> <code>Get User</code></summary>
 
#### Get User
Fetches detailed information about a specific user using the provided `id`. If the user is marked as deleted, the response return deleted status without exposing sensitive or unnecessary data.

#### Request 

> #### Header Parameters 
> | name         |  required | description                                                                                          |
> |--------------|-----------|------------------------------------------------------------------------------------------------------|
> | Content-Type |  yes      | Required for operations with a request body. The value is application/. Where the 'format' is 'json'.|
> | X-CSRF-Token |  yes      | A CSRF token to protect against cross-site request forgery attacks. Must be included in the request.|

> #### Path Parameters
> | Name | Type   | Required | Description                          |
> |------|--------|----------|--------------------------------------|
> | id   | string | **yes**  | The unique identifier of the user.  |


> #### Query Parameters
> | Name | Type   | Required | Description                          |
> |------|--------|----------|--------------------------------------|
> | includeDeleted   | string | **no**  | If set to `true`, includes data for soft-deleted users in the response. By default, only active users are retrieved.  |

#### Response 

> #### Sample Successful Response 
>
> Status Code: `200` <br>
> application/json
>```json
>{
>    "success": true,
>    "message": "User retrieved successfully!",
>    "data": {
>      "id": "01JEVAG858D9NP6A1NMTKXPRRA",
>      "name": "John Doe",
>      "username": "jhondoe123",
>      "email": "john.doe@example.com",
>      "kats": 0,
>      "rank": 0,
>      "isActive": true,
>      "deletedAt": null,
>      "createdAt": "2025-01-13T03:14:41.000Z"
>    }
>}
>```


> #### Response Body Schema
> application/json
>| Key         | Type     | Description                                      |
>|-------------|----------|--------------------------------------------------|
>| success     | boolean  | Indicates whether the request was successful.    |
>| message     | string   | A message providing additional context.          |
>| data        | object   | Contains user authentication details.            |
>| data.id       | string   | Unique identifier for the user (ulid format).  |
>| data.name     | string   | Name for the user.                             |
>| data.email    | string   | Email for the user.                            |
>| data.kats    | number   | Represents the amount of Legion community currency the user possesses.                            |
>| data.rank    | number   | Indicates the user's rank within the Legion community.                            |
>| data.isActive    | boolean   | Indicates if the user is currently active.                            |
>| data.deletedAt    | string   | Date of the user was deleted.                            |
>| data.createdAt    | string   | Date of the user was created (ISO 8601 format).    |


</details>

<details>
 <summary><code>POST</code> <code><b>/users</b></code> <code>Create New User</code></summary>
 
#### Create New User
Allows the creation of a new user in the Legion ecosystem.

#### Request 

> #### Header Parameters 
> | name         |  required | description                                                                                          |
> |--------------|-----------|------------------------------------------------------------------------------------------------------|
> | Content-Type |  yes      | Required for operations with a request body. The value is application/. Where the 'format' is 'json'.|
> | X-CSRF-Token |  yes      | A CSRF token to protect against cross-site request forgery attacks. Must be included in the request.|

> #### Body Schema
> | name          |  type     | Required | description                         |
> |---------------|-----------|----------|-------------------------------------|
> | name          |  string   |**yes**| 	The name for the new user. |
> | username      |  string   |**yes**| 	The username for the new user. |
> | isTotpEnable  |  string   |**yes** | 	If `true` the endpoint will return the otpauth URL used by Auth Apps (e.g., Google Authenticator) to register a new TOTP token.    |
> | password      |  string   |**no** | 	The password for the user. |
> | email         |  string   |**no** | 	The email for the user.    |

#### Response 

> #### Sample Successful Response 
>
> Status Code: `201` <br>
> application/json
>```json
>{
>    "success": true,
>    "message": "User created successfully!",
>    "data": {
>      "id": "01JEVAG858D9NP6A1NMTKXPRRA",
>      "name": "John Doe",
>      "username": "jhondoe123",
>      "email": "john.doe@example.com",
>      "isActive": true,
>      "otpauth": "otpauth://totp/johndoe123?secret=MH27X3S4ZFXEYEPYTARK4TMAZO5CC7LW&issuer=LegionKimitri&algorithm=SHA256&digits=6&period=30",
>      "createdAt": "2025-01-13T03:14:41.000Z"
>    }
>}
>```


> #### Response Body Schema
> application/json
>| Key         | Type     | Description                                      |
>|-------------|----------|--------------------------------------------------|
>| success     | boolean  | Indicates whether the request was successful.    |
>| message     | string   | A message providing additional context.          |
>| data        | object   | Contains user authentication details.            |
>| data.id       | string   | Unique identifier for the created user (ulid format).  |
>| data.name     | string   | Name for the created user.                             |
>| data.email    | string   | Email for the created user.                            |
>| data.isActive    | boolean   | Indicates if the user is currently active.                            |
>| data.otpauth    | string   | OTP authentication URL used to configure authentication apps (e.g., Google Authenticator).    |
>| data.createdAt    | string   | Date of the user was created (ISO 8601 format).    |


</details>

<details>
 <summary><code>PUT</code> 🔒 <code><b>/users/{userId}</b></code> <code>Update User</code></summary>
 
#### Update User
Allows updating user data but prevents updates if the `username` or `email` already exists in another user's account.

#### Request 

> #### Header Parameters 
> | name         |  required | description                                                                                          |
> |--------------|-----------|------------------------------------------------------------------------------------------------------|
> | Content-Type |  yes      | Required for operations with a request body. The value is application/. Where the 'format' is 'json'.|
> | X-CSRF-Token |  yes      | A CSRF token to protect against cross-site request forgery attacks. Must be included in the request.|
> | Authorization |  yes      | A Bearer token in the format `Bearer <JWT>` for authenticating the request and ensuring access.|

> #### Path Parameters
> | Name | Type   | Required | Description                          |
> |------|--------|----------|--------------------------------------|
> | id   | string | **yes**  | The unique identifier of the user.  |

> #### Body Schema
> | name          |  type     | Required | description                         |
> |---------------|-----------|----------|-------------------------------------|
> | name          |  string   |**yes**| 	The name for the user. |
> | username      |  string   |**yes**| 	The username for the user. |
> | email         |  string   |**no** | 	The email for the user.    |

#### Response 

> #### Sample Successful Response 
>
> Status Code: `200` <br>
> application/json
>```json
>{
>    "success": true,
>    "message": "User updated successfully!",
>    "data": {
>      "id": "01JEVAG858D9NP6A1NMTKXPRRA",
>      "name": "John Doe",
>      "username": "jhondoe123",
>      "email": "john.doe@example.com",
>      "isActive": true,
>      "createdAt": "2025-01-13T03:14:41.000Z"
>    }
>}
>```


> #### Response Body Schema
> application/json
>| Key         | Type     | Description                                      |
>|-------------|----------|--------------------------------------------------|
>| success     | boolean  | Indicates whether the request was successful.    |
>| message     | string   | A message providing additional context.          |
>| data        | object   | Contains user authentication details.            |
>| data.id       | string   | Unique identifier for the user (ulid format).  |
>| data.name     | string   | Name for the user.                             |
>| data.email    | string   | Email for the user.                            |
>| data.isActive    | boolean   | Indicates if the user is currently active.                            |
>| data.createdAt    | string   | Date of the user was created (ISO 8601 format).    |


</details>

<details>
 <summary><code>DELETE</code> 🔒 <code><b>/users/{userId}</b></code> <code>Delete User</code></summary>
 
#### Delete User
Allows soft deletion for users. When using this endpoint, users are marked as deleted without permanently removing their data from the database. This approach helps maintain data integrity and prevents potential issues with foreign key constraints.

#### Request 

> #### Header Parameters 
> | name         |  required | description                                                                                          |
> |--------------|-----------|------------------------------------------------------------------------------------------------------|
> | Content-Type |  yes      | Required for operations with a request body. The value is application/. Where the 'format' is 'json'.|
> | X-CSRF-Token |  yes      | A CSRF token to protect against cross-site request forgery attacks. Must be included in the request.|
> | Authorization |  yes      | A Bearer token in the format `Bearer <JWT>` for authenticating the request and ensuring access.|

> #### Path Parameters
> | Name | Type   | Required | Description                          |
> |------|--------|----------|--------------------------------------|
> | id   | string | **yes**  | The unique identifier of the user.  |

#### Response 

> #### Sample Successful Response 
>
> Status Code: `200` <br>
> application/json
>```json
>{
>    "success": true,
>    "message": "User deleted successfully!",
>    "data": {
>      "id": "01JEVAG858D9NP6A1NMTKXPRRA",
>      "name": "John Doe",
>      "username": "jhondoe123",
>      "email": "john.doe@example.com",
>      "kats": 0,
>      "rank": 0,
>      "isActive": true,
>      "deletedAt": "2025-01-14T03:14:41.000Z",
>      "createdAt": "2025-01-13T03:14:41.000Z"
>    }
>}
>```


> #### Response Body Schema
> application/json
>| Key         | Type     | Description                                      |
>|-------------|----------|--------------------------------------------------|
>| success     | boolean  | Indicates whether the request was successful.    |
>| message     | string   | A message providing additional context.          |
>| data        | object   | Contains user authentication details.            |
>| data.id       | string   | Unique identifier for the user (ulid format).  |
>| data.name     | string   | Name for the user.                             |
>| data.email    | string   | Email for the user.                            |
>| data.kats    | number   | Represents the amount of Legion community currency the user possesses.                            |
>| data.rank    | number   | Indicates the user's rank within the Legion community.                            |
>| data.isActive    | boolean   | Indicates if the user is currently active.                            |
>| data.deletedAt    | string   | Date of the user was deleted.                            |
>| data.createdAt    | string   | Date of the user was created (ISO 8601 format).    |


</details>


------------------------------------------------------------------------------------------

## Error Codes

<details>
 <summary><code><b>400</b></code> <code>Bad Request</code></summary>

#### Bad Request
The server could not understand the request. Indicates one of these conditions:

- The API cannot convert the payload data to the underlying data type.
- The data is not in the expected data format.
- A required field is not available.
- A simple data validation error occurred.

</details>

<details>
 <summary><code><b>401</b></code> <code>Unauthorized</code></summary>

#### Unauthorized
The request requires user authentication. This error may occur under the following conditions:

- The request did not include valid authentication credentials.
- The provided credentials are invalid or incorrect.
- The authentication token has expired or is missing.
- The user does not have permission to access the requested resource.

</details>

<details>
 <summary><code><b>403</b></code> <code>Forbidden</code></summary>

#### Forbidden
The client is not authorized to access this resource although it might have valid credentials. For example, the client does not have the correct JWT Token.

</details>

<details>
 <summary><code><b>404</b></code> <code>Not Found</code></summary>

#### Not Found
The server did not find anything that matches the request URI. Either the URI is incorrect or the resource is not available. For example, no data exists in the database at that key.

</details>

<details>
 <summary><code><b>406</b></code> <code>Not Acceptable</code></summary>

#### Not Acceptable
The server cannot use the client-request media type to return the response payload. For example, this error occurs if the client sends an Accept: `application/xml` request header but the API can generate only an `application/json` response.

</details>

<details>
 <summary><code><b>409</b></code> <code>Conflict</code></summary>

#### Conflict
The request could not be completed due to a conflict with the current state of the resource. This typically happens when there is an issue that prevents the server from processing the request because it would create an inconsistency. Common scenarios include:

- Resource conflict: Trying to create or update a resource that already exists, such as attempting to create a user with an email address that is already in use.
- Version conflict: Attempting to update a resource with outdated data or conflicting changes, such as trying to update a record that has been modified since it was last fetched.
- State conflict: Attempting an operation that is not allowed based on the current state of the resource, such as trying to delete a resource that is in use or locked.
</details>

<details>
 <summary><code><b>415</b></code> <code>Unsupported Media Type</code></summary>

#### Unsupported Media Type
The API cannot process the media type of the request payload. For example:
- The client sends a request with an unsupported Content-Type (e.g., sending application/xml when the server only supports application/json).
- The server cannot process the data in the Content-Type because it’s in an unexpected format (e.g., trying to upload a `.jpg` file when only `.png` files are allowed).
- The Content-Type header is missing or malformed.
</details>

<details>
 <summary><code><b>422</b></code> <code>Unprocessable Entity</code></summary>

#### Unprocessable Entity
The API cannot complete the requested action and might require interaction with APIs or processes outside of the current request. For example, this error occurs for any business validation errors, including errors that are not usually of the `400` type.
</details>

<details>
 <summary><code><b>429</b></code> <code>Too Many Requests</code></summary>

#### Too Many Requests
The rate limit for the user, application, or token exceeds a predefined value.
</details>

<details>
 <summary><code><b>500</b></code> <code>Internal Server Error</code></summary>

#### Internal Server Error
A system or application error occurred. Although the client appears to provide a correct request, something unexpected occurred on the server.
</details>

<details>
 <summary><code><b>503</b></code> <code>Service Unavailable</code></summary>

#### Service Unavailable
The server cannot handle the request for a service due to temporary maintenance.

</details>

## Legionnaire Contributors

<a href="https://github.com/kimitrii/legion-api/graphs/contributors">
  <img src="https://contributors-img.web.app/image?repo=kimitrii/legion-api&max=500" alt="contributors list"/>
</a>