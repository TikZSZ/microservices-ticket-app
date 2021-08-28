import {scrypt,randomBytes} from "crypto"
import {promisify} from "util"

const Scrypt = promisify(scrypt)

export class PasswordManager{
  static async toHash(password:string){
    const salt = randomBytes(8).toString('hex')
    const hashedPasswordBuf =await  Scrypt(password,salt,64) as Buffer
    const hashedPassword = hashedPasswordBuf.toString('hex')
    return(`${hashedPassword}.${salt}`)
  }
  private static async hashToCompare(suppliedPassword:string,salt:string){
    const suppliedPasswordHashBuf= await Scrypt(suppliedPassword,salt,64) as Buffer
    return suppliedPasswordHashBuf.toString('hex')
  }

  static async compare(storedPassword:string,suppliedPassword:string){
    const [ hashedPassword,salt] = storedPassword.split(".")
    const suppliedPasswordHash = await this.hashToCompare(suppliedPassword,salt)
    return hashedPassword === suppliedPasswordHash
  }
}