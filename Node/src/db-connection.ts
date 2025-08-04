import { createConnection, Connection } from 'typeorm';

let connection: Connection;

export const getConnection = async (): Promise<Connection> => {
    if (!connection) {
        connection = await createConnection();        
    }
    return connection;
};
