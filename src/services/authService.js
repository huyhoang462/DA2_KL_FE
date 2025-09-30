export const handleLogin = async ({ email, password }) => {
  // Giả lập gọi API thật với fetch và delay
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      if (email === 'hoangpk@gmail.com' && password === '123456') {
        resolve({
          token: 'addfke3859NFm29FFqe',
          user: { name: 'Nguyen Van A', email: email },
        });
      } else {
        // Giả lập lỗi trả về từ BE
        reject({
          status: 401,
          error: 'Invalid email or password',
        });
      }
    }, 800); // delay 800ms cho giống gọi API thật
  });
};
