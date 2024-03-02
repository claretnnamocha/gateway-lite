import { DataTypes, UUIDV4 } from "sequelize";
import {
  Column,
  DataType,
  IsUUID,
  Model,
  PrimaryKey,
  Table,
} from "sequelize-typescript";

@Table({ tableName: "route", timestamps: true })

// Route model
export class Route extends Model {
  // Primary key, automatically generated UUID
  @IsUUID("4")
  @PrimaryKey
  @Column({
    defaultValue: UUIDV4,
    type: DataTypes.STRING,
  })
  id: string;

  // Path for the route
  @Column({
    type: DataType.STRING,
    allowNull: false,
  })
  path: string;

  // Base URL for the route
  @Column({
    type: DataType.STRING,
    allowNull: false,
  })
  baseUrl: string;
}
