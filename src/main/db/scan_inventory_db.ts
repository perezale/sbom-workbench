/* eslint-disable @typescript-eslint/no-this-alias */
/* eslint-disable func-names */
/* eslint-disable no-await-in-loop */
/* eslint-disable @typescript-eslint/no-useless-constructor */
/* eslint-disable no-async-promise-executor */
/* eslint-disable @typescript-eslint/ban-types */
/* eslint-disable no-restricted-syntax */
import { Querys } from './querys_db';
import { Db } from './db';
import { ComponentDb } from './scan_component_db';

const query = new Querys();

export class InventoryDb extends Db {
  component: any;

  constructor(path: string) {
    super(path);
    this.component = new ComponentDb(path);
  }

  private getByFilePath(path: string) {
    return new Promise(async (resolve, reject) => {
      try {
        const db = await this.openDb();
        db.run(
          query.SQL_SCAN_SELECT_INVENTORIES_FROM_PATH,
          path,
          (err: object, data: any) => {
            db.close();
            if (err) resolve(undefined);
            else resolve(data);
          }
        );
      } catch (error) {
        reject(new Error('The inventory does not exists'));
      }
    });
  }

  private getByPurlVersion(inventory: any) {
    return new Promise(async (resolve, reject) => {
      try {
        const db = await this.openDb();
        db.all(
          query.SQL_SCAN_SELECT_INVENTORIES_FROM_PURL,
          inventory.purl,
          inventory.version,
          (err: object, inv: any) => {
            db.close();
            if (err) resolve(undefined);
            else resolve(inv);
          }
        );
      } catch (error) {
        reject(new Error('The inventory does not exists'));
      }
    });
  }

  private getAll() {
    return new Promise(async (resolve, reject) => {
      try {
        const db = await this.openDb();
        db.all(query.SQL_GET_ALL_INVENTORIES, (err: object, inv: any) => {
          db.close();
          if (err) resolve(undefined);
          else resolve(inv);
        });
      } catch (error) {
        reject(new Error('The inventory does not exists'));
      }
    });
  }

  // CREATE NEW FILE INVENTORY
  async newFileInventory(newInventory: any, invId: number) {
    const db = await this.openDb();
    for (const path of newInventory.files) {
      db.run(query.SQL_INSERT_FILE_INVENTORIES, path, invId);
    }
  }

  // GET INVENTORIES
  get(inventory: any) {
    return new Promise(async (resolve, reject) => {
      try {
        let inventories: any;
        if (inventory.path) {
          inventories = await this.getByFilePath(inventory.path);
        } else if (inventory.purl && inventory.version) {
          inventories = await this.getByPurlVersion(inventory);
        } else if (inventory.id) {
          inventories = await this.getById(inventory);
        } else {
          inventories = await this.getAll();
        }

        if (inventory !== undefined) {
          for (let i = 0; i < inventories.length; i += 1) {
            const comp = await this.component.get(inventories[i]);
            inventories[i].component = comp;
            // Remove purl and version from inventory
            delete inventories[i].purl;
            delete inventories[i].version;
          }
          resolve(inventories);
        } else {
          resolve('[]');
        }
      } catch (error) {
        reject(new Error('error'));
      }
    });
  }

  private getById(inventory) {
    return new Promise(async (resolve, reject) => {
      try {
        const db = await this.openDb();
        db.all(
          query.SQL_GET_INEVNTORY_BY_ID,
          `${inventory.id}`,
          (err: object, inv: any) => {
            db.close();
            if (err) resolve(undefined);
            else resolve(inv);
          }
        );
      } catch (error) {
        reject(new Error('The inventory does not exists'));
      }
    });
  }

  // NEW INVENTORY
  async create(inventory: any) {
    const self = this;
    const db = await this.openDb();
    return new Promise<number>(async (resolve, reject) => {
      db.run(
        query.SQL_SCAN_INVENTORY_INSERT,
        inventory.compid ? inventory.compid : 0,
        inventory.version,
        inventory.purl,
        inventory.usage ? inventory.usage : 'n/a',
        inventory.notes ? inventory.notes : 'n/a',
        inventory.url ? inventory.url : 'n/a',
        inventory.license_name ? inventory.license_name : 'n/a',
        async function (this: any, err: any) {
          await self.newFileInventory(inventory, this.lastID);
          if (err) {
            reject(new Error(err));
          } else {
            resolve(this.lastID);
          }
        }
      );
    });
  }

  // UPDATE INVENTORY
  update(inventory: any) {
    return new Promise(async (resolve, reject) => {
      try {
        let success: any;
        if (inventory.id !== undefined) {
          success = await this.updateById(inventory);
        } else {
          success = await this.updateByPurl(inventory);
        }
        if (success) resolve(success);
        else resolve(false);
      } catch (error) {
        reject(new Error('Inventory was not updated'));
      }
    });
  }

  private updateByPurl(inventory) {
    return new Promise(async (resolve) => {
      try {
        const db = await this.openDb();
        db.run(
          query.SQL_UPDATE_INVENTORY_BY_PURL_VERSION,
          inventory.compid ? inventory.compid : 0,
          inventory.version,
          inventory.purl,
          inventory.usage ? inventory.usage : 'n/a',
          inventory.notes ? inventory.notes : 'n/a',
          inventory.url ? inventory.url : 'n/a',
          inventory.license_name ? inventory.license_name : 'n/a',
          inventory.purl,
          inventory.version,
          async function (this: any, err: any) {
            if (err) resolve(false);
            resolve(true);
          }
        );
      } catch (error) {
        resolve(false);
      }
    });
  }

  private updateById(inventory: any) {
    return new Promise(async (resolve) => {
      try {
        const db = await this.openDb();
        db.run(
          query.SQL_UPDATE_INVENTORY_BY_ID,
          inventory.compid ? inventory.compid : 0,
          inventory.version,
          inventory.purl,
          inventory.usage ? inventory.usage : 'n/a',
          inventory.notes ? inventory.notes : 'n/a',
          inventory.url ? inventory.url : 'n/a',
          inventory.license_name ? inventory.license_name : 'n/a',
          inventory.id,
          async function (err: any) {
            db.close();
            if (err) resolve(false);
            resolve(true);
          }
        );
      } catch (error) {
        resolve(false);
      }
    });
  }

  // GET ALL THE INVENTORIES ATTACHED TO A COMPONENT
  getAllAttachedToAComponent(component: any) {
    return new Promise(async (resolve, reject) => {
      try {
        const db = await this.openDb();
        db.serialize(function () {
          db.all(
            query.SQL_SELECT_ALL_INVENTORIES_ATTACHED_TO_COMPONENT,
            `${component.purl}`,
            `${component.version}`,
            (err: any, data: any) => {
              db.close();
              if (err) reject(new Error('[]'));
              else resolve(data);
            }
          );
        });
      } catch (error) {
        reject(new Error('[]'));
      }
    });
  }

  // GET ALL THE INVENTORIES ATTACHED TO A FILE
  getAllAttachedToAFile(inventory: any) {
    return new Promise(async (resolve, reject) => {
      try {
        const db = await this.openDb();
        db.serialize(function () {
          db.all(
            query.SQL_SELECT_ALL_INVENTORIES_FROM_FILE,
            `${inventory.file}`,
            (err: any, data: any) => {
              db.close();
              if (err) reject(new Error('[]'));
              else resolve(data);
            }
          );
        });
      } catch (error) {
        reject(new Error('[]'));
      }
    });
  }
}