module.exports = function (mongoose) {
  return async function (func) {

    const session = await mongoose.startSession();
    session.startTransaction();

    let isCommit = false;
    let isAbort = false;

    let commit = async () => { isCommit = true; return await session.commitTransaction(); };
    let abort = async () => { isAbort = true; return await session.abortTransaction(); };

    try {
      return await func(session, commit, abort);

    } catch (e) {
      if (!isAbort && !isCommit) {
        isAbort = true;
        await session.abortTransaction();
      }
      throw e;

    } finally {
      if (!isAbort && !isCommit) {
        await session.commitTransaction();
      }
      session.endSession();
    }

  }
}
