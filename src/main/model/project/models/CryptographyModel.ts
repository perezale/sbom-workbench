import util from 'util';
import sqlite3 from 'sqlite3';
import { queries } from '../../querys_db';
import { Model } from '../../Model';
import { Cryptography } from '../../entity/Cryptography';

export class CryptographyModel extends Model {
  private connection: sqlite3.Database;

  public constructor(conn: sqlite3.Database) {
    super();
    this.connection = conn;
  }

  public async insertAll(cryptography: Array<{ purl: string, version: string, algorithms: string }>): Promise<void> {
    return new Promise<void>(async (resolve, reject) => {
      this.connection.serialize(async () => {
        this.connection.run('begin transaction');

        cryptography.forEach((c) => {
          this.connection.run(
            'INSERT OR IGNORE INTO cryptography (purl,version,algorithms) VALUES(?,?,?);',
            c.purl,
            c.version,
            c.algorithms,
          );
        });

        this.connection.run('commit', (err: any) => {
          if (!err) resolve();
          reject(err);
        });
      });
    });
  }

  public async findAll() : Promise<Array<Cryptography>> {
    const query = queries.SQL_GET_ALL_CRYPTOGRAPHY;
    const call = await util.promisify(this.connection.all.bind(this.connection)) as any;
    const response = await call(query);
    const crypto = this.cryptographyAdapter(response);
    return crypto;
  }

  public async findAllDetected(): Promise<Array<Cryptography>> {
    const query = queries.SQL_GET_ALL_DETECTED_CRYPTOGRAPHY;
    const call = await util.promisify(this.connection.all.bind(this.connection)) as any;
    const response = await call(query);
    const crypto = this.cryptographyAdapter(response);
    return crypto;
  }

  public async findAllIdentifiedMatched(): Promise<Array<Cryptography>> {
    const query = queries.SQL_GET_ALL_IDENTIFIED_CRYPTOGRAPHY;
    const call = await util.promisify(this.connection.all.bind(this.connection)) as any;
    const response = await call(query);
    const crypto = this.cryptographyAdapter(response);
    return crypto;
  }

  public async deleteAll() {
    const query = queries.SQL_DELETE_CRYPTOGRAPHY;
    const call = await util.promisify(this.connection.run.bind(this.connection));
    await call(query);
  }

  public async getAllIdentifiedAlgorithms() {
    const query = queries.SQL_GET_ALL_IDENTIFIED_ALGORITHMS;
    const call = await util.promisify(this.connection.get.bind(this.connection));
    const response = await call(query) as any;
    if (!response.algorithms) return [];
    const allAlgorithms = JSON.parse(response.algorithms);
    if (!allAlgorithms) return [];
    const algorithms = allAlgorithms.map((a) => a.algorithm);
    return Array.from(new Set(algorithms).values());
  }

  private cryptographyAdapter(cryptography: Array<{ purl: string, version: string, algorithms: string }>): Array<Cryptography> {
    return cryptography.map((c) => ({ purl: c.purl, version: c.version, algorithms: JSON.parse(c.algorithms) }));
  }
}
