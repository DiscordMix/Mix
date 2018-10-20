import {parseString} from "xml2js";
import fs from "fs";

export type ICommandInfo = {
    readonly name: string;
    readonly aliases: string[];
}

export default abstract class CommandXmlParser {
    public static parse(xmlString: string): Promise<ICommandInfo | null> {
        return new Promise((resolve, reject) => {
            parseString(xmlString, {
                trim: true
            }, (error: Error, result: any) => {
                if (error) {
                    reject(error);

                    return;
                }

                resolve(result || null);
            });
        });
    }

    public static async parseFromFile(filePath: string): Promise<ICommandInfo | null> {
        return new Promise<ICommandInfo | null>((resolve, reject) => {
            fs.readFile(filePath, (error: Error, data: Buffer) => {
                if (error) {
                    reject(error);

                    return;
                }

                resolve(CommandXmlParser.parse(data.toString()));

                return;
            });
        });
    }
}
