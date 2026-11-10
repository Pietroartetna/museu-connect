import { test } from "node:test";
import assert from "node:assert/strict";
import { MUSEO_EMAIL, contactMessageSchema } from "./contact";
test("museum contact destination is its official mailbox",()=>assert.equal(MUSEO_EMAIL,"casamuseonicolosi@gmail.com"));
test("invalid messages cannot be submitted",()=>assert.equal(contactMessageSchema.safeParse({name:"a",email:"invalid",message:"short"}).success,false));