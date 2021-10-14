import { LoginEvents } from '../Login/props'
import { RegisterEvents } from '../Register/props'

export interface GuardEvents extends LoginEvents, RegisterEvents {}
