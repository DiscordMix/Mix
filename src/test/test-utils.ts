export default abstract class TestUtils {
    public static randomString(): string {
        return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
    }

    public static randomStringX(length: number): string {
        if (length < 1) {
            throw new Error("[randomStringX] Expecting length to be a number higher than 0");
        }
    
        let finalString: string = "";
    
        for (let i: number = 0; i < length; i++) {
            finalString += TestUtils.randomString();
        }
    
        return finalString;
    }
}