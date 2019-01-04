### Code style

In order to ensure consistency and readability, this project is governed by the following syntax style.

The concept is that similar groups of code should be grouped together (no empty lines in between), while different groups of code should be separated by new lines.

Below lie outlined the different possible groups of code which should be separated, along with examples and the rules to follow.

1. Keywords are always separated

```ts
function example(): boolean {
    let bool: boolean = false;

    do {
        bool = globalMethod();
    }
    while (!bool);

    return !bool;
}
```

2. Do not use redundant `else` conditions

```ts
function example(flag: boolean): void {
    if (flag && globalMethod()) {
        return !flag;
    }

    // Notice that there is no need to use an 'else' condition

    return flag;
}
```

3. Group variable declarations

```ts
const flag: boolean = true;
let num: number = 5;

num = num + 5;
```

4. Group variable assignment statements

```ts
let flag: boolean = true;

flag = !flag;
flag = globalMethod();
```

```ts
let flag: boolean = false;

flag = !flag;

let num: number = 5;

num = 3;
num = num % 10;
```