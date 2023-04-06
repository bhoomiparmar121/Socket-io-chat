import {User} from './user.model';
import {Room} from './room.model';
import {ObjectId} from 'bson';
import {Prop, Schema, SchemaFactory} from "@nestjs/mongoose";
import {Types} from "mongoose";

@Schema()
export class Message {

  _id: ObjectId | string;

  @Prop({required: true})
  message: string;

  @Prop({required: true})
  created: string;

  @Prop()
  urls: string;

  @Prop()
  type: string;

  @Prop()
  sender: string;

  @Prop()
  receiver: [];

  @Prop()
  clearedBy: string;

  @Prop({required: true})
  room: string;

  @Prop({required: true, ref: 'Room', type: Types.ObjectId})
  roomId: Room | string;
}

export const MessageSchema = SchemaFactory.createForClass(Message)
