type Validator = (text: string) => boolean;

const email =
  /^[0-9a-zA-Z]([-_.]?[0-9a-zA-Z])*@[0-9a-zA-Z]([-_.]?[0-9a-zA-Z])*.[a-zA-Z]{2,3}$/i;

/**  최소 8 자, 최소 하나의 문자, 하나의 숫자 및 하나의 특수 문자 */
const password =
  /^(?=.*[A-Za-z])(?=.*\d)(?=.*[$@$!%*#?&])[A-Za-z\d$@$!%*#?&]{8,}$/;
export const isEmail: Validator = (text) => email.test(text);
export const isPassWord: Validator = (text) => password.test(text);
