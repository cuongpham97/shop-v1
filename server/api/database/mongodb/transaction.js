module.exports = function transaction(mongoose) {
  return async function (func) {

    const session = await mongoose.startSession();
    session.startTransaction();

    let promise = Promise.resolve(false);

    function commit() {
      promise = promise.then(async function (isDone) {
        
        if (isDone) {
          throw new Error('Transaction has been committed/aborted');
        }

        await session.commitTransaction();
        return true;
      });
    }

    function abort() {
      promise = promise.then(async function (isDone) {
        
        if (isDone) {
          throw new Error('Transaction has been committed/aborted');
        }

        await session.abortTransaction();
        return true;
      });
    }

    try {
      
      const fnExecute = await func(session, commit, abort);

      promise = promise.then(async function (isDone) {
        if (!isDone) {
          await session.commitTransaction();
        }

        return fnExecute;
      });

      return promise;

    } catch(e) {

      promise = promise.then(async function (isDone) {
        if (!isDone) {
          await session.abortTransaction();
        }
      });

      throw e;

    } finally {
      promise.then(() => session.endSession()); 
    }
  }
}
