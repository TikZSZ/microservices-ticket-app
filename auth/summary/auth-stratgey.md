#### Cookies are a mode of transportation across server and browser.

####

#### It can be used to store JWT or in its own user session id etc(can also be encrypted)

####

#### A JWT is a token (can been encrypted) which can have alot of data`(essentially authentication session data on client side not just id)` and also expiry time mentioned so server can verify its validity unlike cookies (more control) which can be copied and modified JWT can remove requirement of extra db across multiple services, expiring every 15mins or so it can also stay updated

####

#### JWT are easily visible (if not encrypted)  but any change is not permitted due to signing keys and no one can use same data to come up with credentials due to lack of singing key

####

####

#### How to create a JWT -> `it returns a string(serialized)`

```typescript
import jwt from "jsonwebtoken";
const userJwt = jwt.sign(
  {
    id: user.id,
    email: user.email,
  },
  Signing Key,
  {
    customizations object
  }
);

// Store it on session Object or send in cookie
req.session = {
  jwt: userJwt,
};
```
### How to decode a jwt token with verification (use jwt.verify) -> `it returns the whole object`

```typescript
export function currentUser(
  req: RequestWithSession,
  res: Response,
  next: NextFunction
) {
  const jsonToken = req.session?.jwt;
  
  if (!jsonToken) {
    next();
    return;
  }
  try {
    const payload = jwt.verify(jsonToken, process.env.JWT_KEY!) as UserPayload;
    req.currentUser = payload;
  } 
  catch (err) {}


  next();
}
```