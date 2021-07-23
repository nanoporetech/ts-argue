/*
  This is a simple service that reads data from a JSON file,
  offers a file simple transforms and writes mutations back to disk.

  It's only really for demo purposes, and it's safe to say a production
  app would probably use a transactional database, or at least a better
  file structure!
*/
import { assertDefined, Optional } from 'ts-runtime-typecheck';

import fs from 'fs/promises';
import { asDictionaryOf, asJSONValue, isOptString, isString, isStruct } from 'ts-runtime-typecheck';

export interface Contact {
  name: string;
  email?: Optional<string>;
  mobile?: Optional<string>;
}

const as_contact_database = asDictionaryOf(
  isStruct({
    name: isString,
    email: isOptString,
    mobile: isOptString
  })
);
const is_system_error = isStruct({
  message: isString,
  code: isString,
  stack: isString,
});

const DATABASE_LOCATION = './my_contacts.json';

let data: Record<string, Contact> | null = null;

async function ensure_database_loaded(): Promise<void> {
	if (data !== null) {
		return;
	}
	try {
		const raw_data = await fs.readFile(DATABASE_LOCATION, 'utf8');
    const json_value = asJSONValue(JSON.parse(raw_data));
    data = as_contact_database(json_value);
	} catch (err) {
		if (is_system_error(err) && err.code === 'ENOENT') {
			data = {};
		} else {
			throw new Error(`Unable to read contact database from ${DATABASE_LOCATION}`);
		}
	}
}

async function serialize_database() {
	const raw_data = JSON.stringify(data);
	try {
		await fs.writeFile(DATABASE_LOCATION, raw_data);
	} catch (err) {
		console.error(err);
		throw new Error(`Unable to write contact database to ${DATABASE_LOCATION}`);
	}
}

export const contact_database = {
	async insert (contact: Contact): Promise<void> {
		await ensure_database_loaded();
    assertDefined(data);
    
		data[contact.name.toLowerCase()] = { ...contact };
		await serialize_database();
	},
	async get (name: string): Promise<Contact | null> {
		await ensure_database_loaded();
    assertDefined(data);

		return data[name.toLowerCase()] || null;
	},
	async entries (): Promise<Contact[]> {
		await ensure_database_loaded();
    assertDefined(data);

		return Object.values(data);
	},
	async delete (name: string): Promise<void> {
		await ensure_database_loaded();
    assertDefined(data);

		delete data[name.toLowerCase()];
		await serialize_database();
	}
};