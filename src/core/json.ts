import fs from "fs";

export default abstract class JsonUtil {
    /**
     * Write data into a JSON file.
     */
    public static async write(filePath: string, data: any): Promise<void> {
        return new Promise<void>((resolve) => {
            fs.writeFile(filePath, JSON.stringify(data), (error: Error) => {
                if (error) {
                    throw error;
                }

                resolve();
            });
        });
    }

    /**
     * Read data from a JSON file.
     * @return {Promise<ReturnType>} The data from the specified path.
     */
    public static async read<ReturnType = any>(filePath: string): Promise<ReturnType> {
        return new Promise<ReturnType>((resolve, reject) => {
            fs.readFile(filePath, (error: Error, data: any) => {
                if (error) {
                    reject(error);

                    return;
                }

                let parsed: ReturnType;

                try {
                    parsed = JSON.parse(data.toString());
                }
                catch (error) {
                    reject(error);

                    return;
                }

                resolve(parsed);
            });
        });
    }

    /**
     * Write data into a JSON file synchronously.
     */
    public static writeSync(filePath: string, data: any): boolean {
        if (!fs.existsSync(filePath)) {
            return false;
        }

        fs.writeFileSync(filePath, data);

        return true;
    }

    // TODO: Check for errors.
    /**
     * Read data from a JSON file synchronously.
     */
    public static readSync<ReturnType = any>(filePath: string): ReturnType | null {
        return JSON.parse(fs.readFileSync(filePath).toString()) as ReturnType || null;
    }
}
