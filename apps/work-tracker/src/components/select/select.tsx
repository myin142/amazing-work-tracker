import { Fragment, useEffect } from 'react';
import { Listbox, Transition } from '@headlessui/react';
import { HiCheck, HiSelector } from 'react-icons/hi';

/* eslint-disable-next-line */
export interface SelectProps {
  disabled?: boolean;
  selected?: any;
  onSelected: (v: any) => void;
  options: { value: any; label: string }[];
  className?: string;
}

export function Select({
  selected,
  onSelected,
  options,
  disabled,
  className,
}: SelectProps) {
  const selectedOption = options.find((opt) => opt.value === selected);

  useEffect(() => {
    if (!selectedOption && options.length > 0) {
      onSelected(options[0].value);
    }
  }, [selectedOption, onSelected, options]);

  return (
    <Listbox value={selected} onChange={onSelected} disabled={disabled}>
      <div className={`relative mt-1 ${className}`}>
        <Listbox.Button
          className={({ disabled }) =>
            `relative w-full cursor-default rounded-lg py-2 pl-3 pr-10 text-left outline-none ring-1 ring-slate-200 ring-opacity-75 sm:text-sm
            focus-visible:border-indigo-500 focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 ${
              disabled ? 'bg-slate-100 text-slate-400' : 'bg-white'
            }`
          }
        >
          <span className="block truncate">{selectedOption?.label}</span>
          <span className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-2">
            <HiSelector className="h-5 w-5 text-gray-400" aria-hidden="true" />
          </span>
        </Listbox.Button>
        <Transition
          as={Fragment}
          leave="transition ease-in duration-100"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <Listbox.Options className="z-10 absolute mt-1 max-h-60 w-full overflow-auto rounded-md bg-white py-1 text-base shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none sm:text-sm">
            {options.map((opt) => (
              <Listbox.Option
                key={opt.value}
                className={({ active }) =>
                  `relative cursor-default select-none py-2 pl-10 pr-4 ${
                    active ? 'bg-amber-100 text-amber-900' : 'text-gray-900'
                  }`
                }
                value={opt.value}
              >
                {({ selected }) => (
                  <>
                    <span
                      className={`block truncate ${
                        selected ? 'font-medium' : 'font-normal'
                      }`}
                    >
                      {opt.label}
                    </span>
                    {selected ? (
                      <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-amber-600">
                        <HiCheck className="h-5 w-5" aria-hidden="true" />
                      </span>
                    ) : null}
                  </>
                )}
              </Listbox.Option>
            ))}
          </Listbox.Options>
        </Transition>
      </div>
    </Listbox>
  );
}

export default Select;
