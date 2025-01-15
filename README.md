# Legion API

The **Legion API** powers the community hub for Kimitri’s fans, providing endpoints for user interactions as well as administrative endpoints for management. It serves as the backbone for all integrations within the Legion ecosystem, ensuring connectivity and scalability.


#### Contents

- [Quick Start](#quick-start)
- [Security](#security)
- [REST APIs](#rest-apis)
    - [Authentication](#authentication)
- [Error Codes](#error-codes)

## Quick Start

To run the Legion API locally, make contributions, or integrate it with your application, follow the  [Contribution Guidelines](./CONTRIBUTING.md).

## Security

For information on reporting security vulnerabilities in Legion API, see
[SECURITY.md](./SECURITY.md).
  
## REST APIs

Lists API endpoints for easier integration with your application. You can call the Legion API in any language. 
>⚠We do not provide sandbox URL. If you need endpoints to assist in developing your application, follow the [Contribution Guidelines](./CONTRIBUTING.md) to run Legion API locally.

### Users

<details>
 <summary><code>POST</code> <code><b>/auth/user</b></code> <code>Create New User</code></summary>
 
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
> | username      |  string   |**yes**| 	The user for the new user. |
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
>      "isDeleted": false,
>      "createdAt": "2025-01-13T03:14:41.000Z"
>    }
>}
>```


> #### Response Schema
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
>| data.isDeleted    | boolean   | Indicates if the user has been marked as deleted.                           |
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