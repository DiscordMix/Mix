import ScriptOperations from "./scripts";

export default abstract class GitOperations {
    public static pull(): Promise<boolean> {
        return ScriptOperations.execute("git", "pull");
    }

    public static pullSync(): boolean {
        return ScriptOperations.executeSync("git", "pull");
    }

    public static push(): Promise<boolean> {
        return ScriptOperations.execute("git", "push");
    }

    public static pushSync(): boolean {
        return ScriptOperations.executeSync("git", "push");
    }

    public static merge(branch: string): Promise<boolean> {
        return ScriptOperations.execute("git", "merge", branch);
    }

    public static mergeSync(branch: string): boolean {
        return ScriptOperations.executeSync("git", "merge", branch);
    }

    public static branch(name: string): Promise<boolean> {
        return ScriptOperations.execute("git", "checkout", name);
    }

    public static branchSync(name: string): boolean {
        return ScriptOperations.executeSync("git", "checkout", name);
    }

    public add(items: string = "*"): Promise<boolean> {
        return ScriptOperations.execute("git", "add", items);
    }

    public addSync(items: string = "*"): boolean {
        return ScriptOperations.executeSync("git", "add", items);
    }

    public static commit(message: string): Promise<boolean> {
        return ScriptOperations.execute("git", "commit", "-m", message);
    }

    public static commitSync(message: string): boolean {
        return ScriptOperations.executeSync("git", "commit", "-m", message);
    }

    public static commitAll(message: string): Promise<boolean> {
        return ScriptOperations.execute("git", "commit", "-am", message);
    }

    public static commitAllSync(message: string): boolean {
        return ScriptOperations.executeSync("git", "commit", "-am", message);
    }

    public static revert(commit: string = "HEAD"): Promise<boolean> {
        return ScriptOperations.execute("git", "revert", commit);
    }

    public static revertSync(commit: string = "HEAD"): boolean {
        return ScriptOperations.executeSync("git", "revert", commit);
    }
}