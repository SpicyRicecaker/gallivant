class Some<T> {
  value: T
  constructor(value: T) {
    this.value = value
  }
}

// eslint-disable-next-line @typescript-eslint/no-extraneous-class, @typescript-eslint/no-unused-vars
class None<T> {}

export class Option<T> {
  value: Some<T> | None<T>
  constructor(value: Some<T> | None<T>) {
    this.value = value
  }

  bind<U>(f: (value: T) => Option<NonNullable<U>>): Option<NonNullable<U>> {
    if (this.value === none) {
      return none
    }
    return f((this.value as Some<T>).value)
  }

  map<U>(f: (value: T) => U): Option<NonNullable<U>> {
    if (this.value === none) {
      return none
    }
    return Monad.unit(f((this.value as Some<T>).value))
  }

  each(f: (value: T) => void): void {
    if (this.value === none) {
      return
    }
    f((this.value as Some<T>).value)
  }

  async eachP(f: (value: T) => Promise<void>): Promise<void> {
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

  static unit<T>(v: T): Option<NonNullable<T>> {
    if (v !== undefined && v !== null) {
      return this.some(v as NonNullable<T>)
    } else {
      return none
    }
  }
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const none: any = new None<any>()
