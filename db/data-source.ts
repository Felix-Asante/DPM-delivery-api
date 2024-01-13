import { DataSource, DataSourceOptions } from 'typeorm';

const NODE_ENV = process.env.NODE_ENV;

export const dataSourceOption: any = {
  name: 'default',
  type: 'postgres',
  host: process.env.TYPEORM_HOST,
  port: Number(process.env.TYPEORM_PORT),
  username: process.env.TYPEORM_USERNAME,
  password: process.env.TYPEORM_PASSWORD,
  database: process.env.TYPEORM_DATABASE,

  synchronize: NODE_ENV !== 'production',
  dropSchema: false,
  logging: ['error', 'warn'],
  autoLoadEntities: true,
  ssl: true,
  // sslmode: 'require',
  entities: [`${NODE_ENV === 'test' ? 'src' : 'dist'}/**/**.entity{.ts,.js}`],
  migrations: ['dist/db/migrations/*.js'],
};

const dataSource = new DataSource(dataSourceOption);
export default dataSource;
