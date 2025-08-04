import 'reflect-metadata';
import Container from "typedi";
import { App } from './app';
import '../dotenv'

const application = Container.get(App)
void application.startExpressServer()
