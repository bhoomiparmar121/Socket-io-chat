import {Message} from './message.model';
import {User} from './user.model';
import {ObjectId} from 'bson';
import {Prop, Schema, SchemaFactory} from "@nestjs/mongoose";
import {Types} from "mongoose";

@Schema()
export class Room {
  _id: ObjectId | string;

  @Prop({required: true, maxlength: 20, minlength: 2})
  name: string;

  @Prop()
  messages: Message[];

  @Prop({required: true})
  clientId: string;
}

export const RoomSchema = SchemaFactory.createForClass(Room)
