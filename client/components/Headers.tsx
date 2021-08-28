import { CurrentUser } from "../helpers/interface/CurrentUser";
import Link from "next/link"
export const Header=(props:CurrentUser)=>{
  const {currentUser} = props
  
  const links = [
    !currentUser && {label: 'Sign Up', href: '/auth/signup'},
    !currentUser && {label: 'Sign In', href: '/auth/signin'},
    currentUser && {label: 'Sign Out', href: '/auth/signout'}
  ]
  .filter((linkConfig)=>linkConfig)
  .map((link)=>{
    if(link){
      return(
        <li className="nav-item" key={link.href}>
          <Link href={link.href}>
            <a  className="nav-link px-2">
              {link.label}
            </a>
          </Link>
        </li>
      )
    }
    
  })
  return(
    <nav className="navbar navbar-light bg-light">
      <Link href="/">
        <a className="navbar-brand px-3">Stub Hub</a>
      </Link>

      <div className="d-flex justify-content-end px-2">
        <ul className="nav d-flex align-items-center">
          {links}
        </ul>
      </div>
    </nav>
  )
}