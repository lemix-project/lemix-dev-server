const getTime = () => {
    // 时间格式化 YY-MM-DD hh:mm:ss
    let date = new Date();
    let Y = date.getFullYear() + '-';
    let M = (date.getMonth() + 1 < 10 ? '0' + (date.getMonth() + 1) : date.getMonth() + 1) + '-';
    let D = (date.getDate() < 10 ? '0' + date.getDate() : date.getDate()) + '^';
    let h = (date.getHours() < 10 ? '0' + date.getHours() : date.getHours()) + '_';
    let m = (date.getMinutes() < 10 ? '0' + date.getMinutes() : date.getMinutes()) + '_';
    let s = date.getSeconds() < 10 ? '0' + date.getSeconds() : date.getSeconds();
    return Y + M + D + h + m + s;
}

module.exports = getTime


