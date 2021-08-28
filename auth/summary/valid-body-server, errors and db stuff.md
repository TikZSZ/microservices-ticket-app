### 1st Express can use a middleware to throw errors to use it

`just add a middleware of type (err,req,res,next) and throw error once thats done this middleware gets called and you can handle response`

##### exp:


```typescript
export function errorHandler(
  err: Error,
  req: Request,
  res: Response<ErrorResponseBody>,
  next: NextFunction
): void {
  if (err instanceof CustomError) {
    res.status(err.StatusCode).send({ errors: err.serializeError() });
    return;
  }
}
```

### 2nd Express cant throw error if async function is used for this

`run yarn add express-async-errors and import "express-async-errors" after express in index/server.ts`

### 3rd Errors can be customized just

` extend from error and add properties like statusCode and serializeErrorMethod on some Class and call serializeErrorMethod which returns some custom error with some body.`

#

` After that once error of such type is thrown call serializeErrorMethod and send in res.send(serializeErrorMethod) in errorMiddleware`

```typescript
export abstract class CustomError extends Error {
  abstract StatusCode: number;

  constructor(message: string) {
    super(message);
  }
  abstract serializeError(): ErrorStructure[];
}

import { CustomError } from "./custom-error";

export class BadRequestError extends CustomError {
  StatusCode = 400;
  constructor(private meassage: string) {
    super(meassage);
  }
  serializeError() {
    return [
      {
        message: this.meassage,
      },
    ];
  }
}
```

### 4th to Add typechecking to mongoose use

To add custom methods u need to extend a model interface with Document interface as generic param and add method definitions in this interface

`To add the actual method do Schema.statics['method-name'] = ()=>{
  logic
}`

```typescript
interface UserAttrs {
  email: string;
  password: string;
}

interface UserDoc extends mongoose.Document {
  email: string;
  password: string;
}

interface UserModel extends mongoose.Model<UserDoc> {
  build(attrs: UserAttrs): UserDoc;
}

UserSchema.statics.build = (attrs: UserAttrs) => {
  return new UserModel(attrs);
};

const UserSchema = new mongoose.Schema<UserDoc, UserModel>({});

export const UserModel = mongoose.model<UserDoc, UserModel>("User", UserSchema);
```

### 5th Schemas in mongoose have pre method (hooks) which can do some task on save etc (its a callback with this as ref to current doc)`don't use arrow function else this wont map` it doesn't happen on MongoServer but rather on client just as its about to save etc to server that hook is called and then its saved
`You could do a this.password= await Password.toHash(this.password);`
##### `its possible only because of interface`
### and this would work to as this is a ref to current doc

#

```typescript
UserSchema.pre("save", async function (done) {
  if (this.isModified("password")) {
    const hashed = await Password.toHash(this.get("password"));
    this.set("password", hashed);
  }
  done();
});
```

### 6th Hashing and comparing passwords

```typescript
import { scrypt, randomBytes } from "crypto";
import { promisify } from "util";

// to convert from callback to async library also this should return a Buffer
const Scrypt = promisify(scrypt);

export class Password {
  static async toHash(password: string) {
    const salt = randomBytes(8).toString("hex");
    const hashedPasswordBuf = (await Scrypt(password, salt, 64)) as Buffer;
    const hashedPassword = hashedPasswordBuf.toString("hex");
    return `${hashedPassword}.${salt}`;
  }

  static async hashToCompare(password: string, salt: string) {
    const suppliedPasswordHashBuf = (await Scrypt(
      password,
      salt,
      64
    )) as Buffer;
    return suppliedPasswordHashBuf.toString("hex");
  }

  static async compare(storedPassword: string, suppliedPassword: string) {
    const [hashedPassword, salt] = storedPassword.split(".");
    const suppliedPasswordHash = await this.hashToCompare(
      suppliedPassword,
      salt
    );
    return hashedPassword === suppliedPasswordHash;
  }
}
```

### 7th use express-validator instead of custom solutions

```typescript
  import { body, validationResult } from "express-validator";
  router.post(
  "/api/users/signup",
  [
    body(SingUpBody.email).isEmail().withMessage("Email must be valid"),
    body(SingUpBody.password)
      .trim()
      .isLength({ min: 4, max: 20 })
      .withMessage("Password must be between 4 and 20 characters"),
  ],
  async (req: RequestWithBody, res: Response) => {
    const errors = validationResult(req);
    console.log();

    if (!errors.isEmpty()) {
      throw new RequestValidationError(errors.array());
    }
```
