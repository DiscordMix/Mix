// TODO: Disabled for future fix
/* describe("Pagination.next()", () => {
    it("should return the valid next page", () => {
        const pagination: PaginatedMessage = new PaginatedMessage("hello world", 1);

        expect(pagination.getPage()).to.equal("h");
        expect(pagination.next().getPage()).to.equal("e");
        expect(pagination.next().getPage()).to.equal("l");
        expect(pagination.next(-1).getPage()).to.equal("e");
        expect(pagination.next(2).getPage()).to.equal("l");
        expect(pagination.currentPage).to.equal(4);
    });
});

describe("Pagination.previous()", () => {
    it("should return the valid previous page", () => {
        const pagination: PaginatedMessage = new PaginatedMessage("hello world", 1);

        expect(pagination.next(3).previous(2).getPage()).to.equal("e");
        expect(pagination.next(3).previous(1).getPage()).to.equal("l");
        expect(pagination.previous(2).getPage()).to.equal("e");
        expect(pagination.previous(-1).getPage()).to.equal("l");
        expect(pagination.currentPage).to.equal(3);
    });
}); */