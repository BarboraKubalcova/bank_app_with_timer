'use strict';

/////////////////////////////////////////////////
/////////////////////////////////////////////////
// BANKIST APP

/////////////////////////////////////////////////
// Data

// DIFFERENT DATA! Contains movement dates, currency and locale

const account1 = {
  owner: 'Jonas Schmedtmann',
  movements: [200, 455.23, -306.5, 25000, -642.21, -133.9, 79.97, 1300],
  interestRate: 1.2, // %
  pin: 1111,

  movementsDates: [
    '2020-05-08T14:11:59.604Z',
    '2020-05-27T17:01:17.194Z',
    '2020-07-11T23:36:17.929Z',
    '2020-07-12T10:51:36.790Z',
    '2021-07-24T10:17:24.185Z',
    '2021-07-25T09:15:04.904Z',
    '2021-07-26T07:42:02.383Z',
    '2021-07-27T21:31:17.178Z',
  ],
  currency: 'EUR',
  locale: 'pt-PT', // de-DE
};

const account2 = {
  owner: 'Jessica Davis',
  movements: [5000, 3400, -150, -790, -3210, -1000, 8500, -30],
  interestRate: 1.5,
  pin: 2222,

  movementsDates: [
    '2019-11-01T13:15:33.035Z',
    '2019-11-30T09:48:16.867Z',
    '2019-12-25T06:04:23.907Z',
    '2020-01-25T14:18:46.235Z',
    '2020-02-05T16:33:06.386Z',
    '2020-04-10T14:43:26.374Z',
    '2020-06-25T18:49:59.371Z',
    '2020-07-26T12:01:20.894Z',
  ],
  currency: 'USD',
  locale: 'en-US',
};

const accounts = [account1, account2];

/////////////////////////////////////////////////
// Elements
const labelWelcome = document.querySelector('.welcome');
const labelDate = document.querySelector('.date');
const labelBalance = document.querySelector('.balance__value');
const labelSumIn = document.querySelector('.summary__value--in');
const labelSumOut = document.querySelector('.summary__value--out');
const labelSumInterest = document.querySelector('.summary__value--interest');
const labelTimer = document.querySelector('.timer');

const containerApp = document.querySelector('.app');
const containerMovements = document.querySelector('.movements');

const btnLogin = document.querySelector('.login__btn');
const btnTransfer = document.querySelector('.form__btn--transfer');
const btnLoan = document.querySelector('.form__btn--loan');
const btnClose = document.querySelector('.form__btn--close');
const btnSort = document.querySelector('.btn--sort');

const inputLoginUsername = document.querySelector('.login__input--user');
const inputLoginPin = document.querySelector('.login__input--pin');
const inputTransferTo = document.querySelector('.form__input--to');
const inputTransferAmount = document.querySelector('.form__input--amount');
const inputLoanAmount = document.querySelector('.form__input--loan-amount');
const inputCloseUsername = document.querySelector('.form__input--user');
const inputClosePin = document.querySelector('.form__input--pin');

/////////////////////////////////////////////////
// Functions

const formatMovementDate = function (date, locale) {
  const calcDaysPassed = (date1, date2) =>
    Math.round(Math.abs(date2 - date1) / (1000 * 60 * 60 * 24));

  const daysPassed = calcDaysPassed(new Date(), date);

  if (daysPassed === 0) return 'Today';
  if (daysPassed === 1) return 'Yesterday';
  if (daysPassed <= 7) return `${daysPassed} days ago`;

  /*   const day = `${date.getDate()}`.padStart(2, 0);
  const month = `${date.getMonth() + 1}`.padStart(2, 0);
  const year = date.getFullYear();
  return `${day}.${month}.${year}`; */
  return new Intl.DateTimeFormat(locale).format(date);
};

const formatCur = function (value, locale, currency) {
  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency: currency,
  }).format(value);
};

const displayMovements = function (acc, sort = false) {
  containerMovements.innerHTML = '';
  const movs = sort
    ? acc.movements.slice().sort((a, b) => a - b)
    : acc.movements;

  movs.forEach(function (mov, i) {
    const type = mov > 0 ? 'deposit' : 'withdrawal';
    const date = new Date(acc.movementsDates[i]);
    const displayDate = formatMovementDate(date, acc.locale);

    const formattedMov = formatCur(mov, acc.locale, acc.currency);

    const html = `
    <div class="movements__row">
 
          <div class="movements__type movements__type--${type}">${
      i + 1
    } ${type}</div>
    <div class="movements__date">${displayDate}</div>
          <div class="movements__value">${formattedMov}</div>
        </div>
    `;
    containerMovements.insertAdjacentHTML('afterbegin', html); // este je beforeend - zoradi elementy opacne (od 0 po n)
  });
};

// DISPLAY BALANCE
const calcDisplayBalance = function (acc) {
  acc.balance = acc.movements.reduce((acc, mov) => acc + mov, 0);

  labelBalance.textContent = formatCur(acc.balance, acc.locale, acc.currency);
};

// DISPLAY SUMMARY, OUTCOME AND INTEREST
const calcDisplaySummary = function (acc) {
  const incomes = acc.movements
    .filter(mov => mov > 0)
    .reduce((acc, mov) => acc + mov, 0);
  labelSumIn.textContent = formatCur(incomes, acc.locale, acc.currency);

  const out = acc.movements
    .filter(mov => mov <= 0)
    .reduce((acc, mov) => acc + mov, 0);

  labelSumOut.textContent = formatCur(Math.abs(out), acc.locale, acc.currency);

  const interest = acc.movements
    .filter(mov => mov > 0)
    .map(deposit => (deposit * acc.interestRate) / 100)
    .filter((int, i, arr) => {
      // console.log(arr);
      return int >= 1; // pripocita len hodnoty vacsie ako 1
    })
    .reduce((acc, int) => acc + int, 0);

  labelSumInterest.textContent = formatCur(interest, acc.locale, acc.currency);
};

// USER NAME
const createUserNames = function (accs) {
  accs.forEach(function (acc) {
    acc.username = acc.owner
      .toLowerCase()
      .split(' ')
      .map(name => name[0])
      .join('');
  });
};
createUserNames(accounts);

const updateUI = function (acc) {
  // display movements
  displayMovements(acc);
  // display balance
  calcDisplayBalance(acc);
  // display summary
  calcDisplaySummary(acc);
};

const startLogoutTimer = function () {
  const tick = function () {
    const min = String(Math.trunc(time / 60)).padStart(2, 0);
    const sec = String(time % 60).padStart(2, 0);
    // in each call print the remaining time
    labelTimer.textContent = `${min}:${sec}`;
    // when 0 sec log out
    if (time === 0) {
      clearInterval(timer);
      containerApp.style.opacity = 0;
      inputCloseUsername.value = inputClosePin.value = '';
      labelWelcome.textContent = 'Log in to get started';
    }
    // decrease 1 sec
    time--;
  };
  // setting the time
  let time = 120;
  // call the timer every second
  tick();
  const timer = setInterval(tick, 1000);
  return timer;
};

// Event handlers

let currentAccount, timer;

// FAKE ALWAYS LOGGED IN
// currentAccount = account1;
// updateUI(currentAccount);
// containerApp.style.opacity = 100;

// this button is form type - automaticaly refresh page when clicked
// we use event.preventDefault() to stop doing this
// we can also hit enter when we are in form
btnLogin.addEventListener('click', function (e) {
  e.preventDefault(); // prevent form from submiting
  currentAccount = accounts.find(
    acc => acc.username === inputLoginUsername.value
  );
  //console.log(currentAccount);

  if (currentAccount?.pin === +inputLoginPin.value) {
    // display UI and welcome message
    labelWelcome.textContent = `Welcome back, ${
      currentAccount.owner.split(' ')[0]
    }`;
    containerApp.style.opacity = 100;
    /* 
    const now = new Date();
    const day = `${now.getDate()}`.padStart(2, 0);
    const month = `${now.getMonth() + 1}`.padStart(2, 0);
    const year = now.getFullYear();
    const hours = `${now.getHours()}`.padStart(2, 0);
    const min = `${now.getMinutes()}`.padStart(2, 0);

    labelDate.textContent = `${day}.${month}.${year}   ${hours}:${min}`; */
    // day/ month/ year
    // Experimenting API
    const now = new Date();
    const options = {
      hour: 'numeric',
      minute: 'numeric',
      // day: 'numeric',
      day: 'numeric',
      //month: 'long',
      month: 'numeric',
      year: 'numeric',
      // weekday: 'long',
    };
    //const locale = navigator.language;

    labelDate.textContent = new Intl.DateTimeFormat(
      currentAccount.locale,
      options
    ).format(now);

    // clear input fields

    inputLoginUsername.value = inputLoginPin.value = '';
    inputLoginPin.blur();
    // start timer

    if (timer) clearInterval(timer);
    timer = startLogoutTimer();

    // UPDATE CURRENT ACC
    updateUI(currentAccount);
  }
});

btnTransfer.addEventListener('click', function (e) {
  e.preventDefault();
  const amount = +inputTransferAmount.value;
  const receiverAcc = accounts.find(
    acc => acc.username === inputTransferTo.value
  );
  //console.log(amount, receiverAcc);
  inputTransferAmount.value = inputTransferTo.value = '';

  if (
    amount > 0 &&
    receiverAcc &&
    amount <= currentAccount.balance &&
    receiverAcc?.username !== currentAccount.username
  ) {
    // doing transfer
    currentAccount.movements.push(-amount);
    receiverAcc.movements.push(amount);
    // add trasfer date
    currentAccount.movementsDates.push(new Date().toISOString());
    receiverAcc.movementsDates.push(new Date().toISOString());

    // update UI
    updateUI(currentAccount);
    // update timer
    clearInterval(timer);
    timer = startLogoutTimer();
  }
});

btnLoan.addEventListener('click', function (e) {
  e.preventDefault();
  const amount = Math.floor(inputLoanAmount.value);
  if (amount > 0 && currentAccount.movements.some(mov => mov >= amount * 0.1)) {
    setTimeout(function () {
      // add the movement
      currentAccount.movements.push(amount);
      // add loan date
      currentAccount.movementsDates.push(new Date().toISOString());

      updateUI(currentAccount);
    }, 2000);
  }
  inputLoanAmount.value = '';
});

btnClose.addEventListener('click', function (e) {
  e.preventDefault();
  if (
    currentAccount.username === inputCloseUsername.value &&
    currentAccount?.pin === +inputClosePin.value
  ) {
    const index = accounts.findIndex(
      acc => acc.username === currentAccount.username
    );

    // delete account
    console.log(index);
    accounts.splice(index, 1);

    // hide UI
    containerApp.style.opacity = 0;
    inputCloseUsername.value = inputClosePin.value = '';
    labelWelcome.textContent = 'Log in to get started';
  }
});

let sorted = false;

btnSort.addEventListener('click', function (e) {
  e.preventDefault();
  displayMovements(currentAccount, !sorted);
  sorted = !sorted;
});
/////////////////////////////////////////////////
/////////////////////////////////////////////////
// LECTURES
/*
// parsing
console.log(Number.parseInt('30px', 10)); // 30
console.log(Number.parseInt('px30', 10)); // NaN

console.log(Number.parseFloat('2.5rem'));

console.log(Number.isNaN(20 / 0)); // infinity

// checking if value is number, not string or infinity
console.log(Number.isFinite(20 / 0));
console.log(Number.isInteger(23.0 / 0));
*/
/*
console.log(Math.sqrt(25));
console.log(25 ** (1 / 2));
console.log(8 ** (1 / 3));
console.log(Math.max(5, 18, '35', 11, 2));
console.log(Math.min(5, 4, 2, 7, -1));
console.log(Math.PI * Number.parseFloat('10px') ** 2);
console.log(Math.floor(Math.random() * 6) + 1);

const randomInt = (min, max) =>
  Math.floor(Math.random() * (max - min) + 1) + min;
console.log(randomInt(10, 20));

// Rounding integers
console.log(Math.round(23.9)); // 24
console.log(Math.round(23.3)); // 23

console.log(Math.ceil(23.9)); // 24
console.log(Math.ceil(23.3)); // 24

console.log(Math.floor(23.9)); // 23
console.log(Math.floor(23.3)); // 23

console.log(Math.trunc(-23.3)); // -23
console.log(Math.floor(-23.3)); // -24

// Rounding decimals
console.log((2.7).toFixed(0)); // return string
console.log(+(2.7).toFixed(4)); // 4 decimal places
*/

// REMAINDER OPERATOR
/*
labelBalance.addEventListener('click', function () {
  [...document.querySelectorAll('.movements__row')].forEach(function (row, i) {
    if (i % 2 === 0) row.style.backgroundColor = 'orangered';
    if (i % 3 === 0) row.style.backgroundColor = 'blue';
  });
});
*/

// BIG INT
// just add n
/*
console.log(BigInt(34535345));
console.log(100000n + 100000n);
console.log(2345678n * 56789098765n);

console.log(10n / 3n); // 3n - closest big int
*/

// DATES AND TIMES
// create a date
/*
const now = new Date();
console.log(now);

console.log(new Date('Aug 02 2020 18:05:41'));
console.log(new Date('December 24, 2015')); //Thu Dec 24 2015 00:00:00 GMT+0100 (stredoeurópsky štandardný čas)

console.log(new Date(account1.movementsDates[0]));
console.log(new Date(0)); // Jan 01 1970
console.log(new Date(3 * 24 * 60 * 60 * 1000)); // v milisekundach 3 dni // Jan 04 1970
*/
/*
// working with dates
const future = new Date(2037, 10, 19, 15, 23);
console.log(future);
console.log(future.getFullYear());
console.log(future.getMonth()); // 0 based
console.log(future.getDate());
console.log(future.getDay()); // day of the week
console.log(future.getHours());
console.log(future.getMinutes());
console.log(future.getSeconds());
console.log(future.toISOString());
console.log(future.getTime()); // how many secods passed from jan 1970

console.log(new Date(2142253380000));
console.log(Date.now());

future.setFullYear(2040);
console.log(future);
*/
/*
const future = new Date(2037, 10, 19, 15, 23);
console.log(future);
console.log(Number(future));

const calcDaysPassed = (date1, date2) =>
  Math.abs(date2 - date1) / (1000 * 60 * 60 * 24);
const days = calcDaysPassed(new Date(2037, 3, 14), new Date(2037, 3, 4));
console.log(days);
*/
/*
const options = {
  style: 'currency',
  unit: 'celsius',
  currency: 'EUR',
  // useGrouping: false,
};

const num = 456789876543.23;
console.log('GB: ', new Intl.NumberFormat('en-GB', options).format(num));
console.log('SK: ', new Intl.NumberFormat('sk-SK', options).format(num));
console.log('Germany: ', new Intl.NumberFormat('de-DE', options).format(num));
console.log(
  navigator.language,
  new Intl.NumberFormat(navigator.language, options).format(num)
);
*/
// TIMERS
/*
const ingredients = ['olives', 'ham'];

const pizzaTimer = setTimeout(
  (ing1, ing2) => console.log(`Here is your pizza with ${ing1} and ${ing2}`),
  3000,
  ...ingredients
);
console.log('waiting');
if (ingredients.includes('spinach')) clearTimeout(pizzaTimer);

setInterval(function () {
  const now = new Date();
  console.log(now);
}, 3000);
*/
