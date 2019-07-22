"use strict";

jest.mock("@0x-lerna-fork/describe-ref");
jest.mock("@0x-lerna-fork/collect-uncommitted");

const describeRef = require("@0x-lerna-fork/describe-ref");
const collectUncommitted = require("@0x-lerna-fork/collect-uncommitted");
const checkWorkingTree = require("../lib/check-working-tree");

describe("check-working-tree", () => {
  it("resolves on a clean tree with no release tags", async () => {
    describeRef.mockResolvedValueOnce({ refCount: "1" });

    const result = await checkWorkingTree({ cwd: "foo" });

    expect(result).toEqual({ refCount: "1" });
    expect(describeRef).toHaveBeenLastCalledWith({ cwd: "foo" });
  });

  it("rejects when current commit has already been released", async () => {
    describeRef.mockResolvedValueOnce({ refCount: "0" });

    try {
      await checkWorkingTree();
    } catch (err) {
      expect(err.message).toMatch("The current commit has already been released");
    }

    expect.assertions(1);
  });

  it("rejects when working tree has uncommitted changes", async () => {
    describeRef.mockResolvedValueOnce({ isDirty: true });
    collectUncommitted.mockResolvedValueOnce(["AD file"]);

    try {
      await checkWorkingTree();
    } catch (err) {
      expect(err.message).toMatch("Working tree has uncommitted changes");
      expect(err.message).toMatch("\nAD file");
    }

    expect.assertions(2);
  });

  it("passes cwd to collectUncommitted when working tree has uncommitted changes", async () => {
    describeRef.mockResolvedValueOnce({ isDirty: true });
    try {
      await checkWorkingTree({ cwd: "foo" });
    } catch (err) {
      expect(collectUncommitted).toHaveBeenLastCalledWith({ cwd: "foo" });
    }
    expect.assertions(1);
  });
});
