class Some<T> {
  value: T
  constructor(value: T) {
    this.value = value
  }
}

// eslint-disable-next-line @typescript-eslint/no-extraneous-class, @typescript-eslint/no-unused-vars
class None<T> {}

class Option<T> {
  value: Some<T> | None<T>
  constructor(value: Some<T> | None<T>) {
    this.value = value
  }

  map<U>(f: (value: T) => Option<U>): Option<U> {
    if (this.value === none) {
      return none
    }
    return f((this.value as Some<T>).value)
  }

  eachSync(f: (value: T) => void): void {
    if (this.value === none) {
      return
    }
    f((this.value as Some<T>).value)
  }

  async each(f: (value: T) => Promise<void>): Promise<void> {
    if (this.value === none) {
      return
    }
    await f((this.value as Some<T>).value)
  }
}

// eslint-disable-next-line @typescript-eslint/no-extraneous-class
export class Monad {
  static some<T>(value: T): Option<T> {
    const unit = new Some(value)
    const unit2 = new Option(unit)

    return unit2
  }

  static none<T>(): None<T> {
    return none
  }

  static tryInto<T>(v: T): Option<T> {
    if (v !== undefined && v !== null) {
      return this.some(v)
    } else {
      return none
    }
  }
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const none: any = new None<any>()
