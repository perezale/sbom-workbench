import { Table, Column, Model, HasMany, DataType, ForeignKey, BelongsToMany, BelongsTo } from 'sequelize-typescript';
import { Component } from './Component';
import { License } from './License';
import { LicenseVersion } from './LicenseVersion';

@Table({tableName:'Version', modelName:'Version'})
export class Version  extends Model {

  @Column({type: DataType.INTEGER, primaryKey: true, autoIncrement: true})
  id: number;

  @Column({type:DataType.STRING})
  version: string;

  @Column({type:DataType.STRING})
  url: string;

  @ForeignKey(() => Component)
  @Column({type:DataType.INTEGER})
  componentId: number;

  @BelongsTo(() => Component)
  component: Component;


  @BelongsToMany(() => License, () => LicenseVersion)
  licenses: License[];

}