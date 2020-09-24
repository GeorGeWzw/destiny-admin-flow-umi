// 统一全局配置文件

// export const BaseUrl: string = 'http://192.168.0.2:50003/api/';
export const BaseUrl: string = process.env.NODE_ENV == 'development' ? 'http://localhost:50003/api/' : 'http://api.destinycore.club/api/';
// export const BaseUrl: string = 'http://localhost:50003/api/';
console.log(process.env.NODE_ENV);
export const IconFontUrl: Array<string> | string = ['//at.alicdn.com/t/font_1852099_wnyhycs81a.js'];
