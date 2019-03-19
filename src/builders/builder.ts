export default abstract class Builder<T = any> {
    protected result!: T;

    /**
     * Retrieve the current result.
     */
    public build(): T {
        return this.result;
    }
}
