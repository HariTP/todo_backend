const setPriority = (dueDate) => {
    const today = new Date();
    const timeDifference = dueDate.getTime() - today.getTime();
    const daysDifference = Math.ceil(timeDifference / (1000 * 3600 * 24));

    if (daysDifference === 0) {
        return 0; 
    } else if (daysDifference <= 2) {
        return 1; 
    } else if (daysDifference <= 4) {
        return 2; 
    } else {
        return 3; 
    }
}

module.exports = setPriority;