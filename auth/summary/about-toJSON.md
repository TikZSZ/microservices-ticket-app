##### Every object in javascript can specify what should come out when `JSON.stringify(object)` is used it basically overrides `toJSON` property which every object has by default



##### MongoDB's Schema has ton of options like wether to include id or \_id etc it also has toJSON property which can do similar thing also delete can be used `on ret plan object` to delete property of referenced object which gets sent

#

```typescript
interface ReturnedUserDoc {
  id?: string;
  email?: string;
  password?: string;
  _id?: string;
  __v?: string;
}

const UserSchema = new mongoose.Schema<UserDoc, UserModel>(
  { SchemaDeclaration },
  {
    toJSON: {
      transform: (doc: UserDoc, ret: ReturnedUserDoc) => {
        ret.id = ret._id;
        delete ret._id;
        delete ret.password;
        delete ret.__v;
      },
    },
  }
);
```

##### The transform function's second argument ret or returned doc contains a plain object that `corresponds to a Document of this schema and this is what is finally returned when doing stringyFication`

#

#
