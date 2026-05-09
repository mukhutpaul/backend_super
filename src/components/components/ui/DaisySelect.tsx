"use client";

import Select from "react-select";

export const daisySelectStyles = {
    control: () =>
        "input input-bordered w-full min-h-[48px] flex flex-wrap px-2",

    valueContainer: () =>
        "flex gap-1 items-center",

    input: () =>
        "text-sm text-base-content",

    placeholder: () =>
        "text-base-content/50 text-sm",

    menu: () =>
        "bg-base-100 border border-base-300 rounded-box shadow-lg mt-2 z-50 overflow-hidden",

    menuList: () =>
        "max-h-60 overflow-y-auto",

    option: ({ isFocused, isSelected }: any) =>
        `
        px-4 py-2 cursor-pointer text-sm
        ${isFocused ? "bg-base-200" : ""}
        ${isSelected ? "bg-primary text-primary-content" : ""}
    `,

    singleValue: () =>
        "text-sm text-base-content",

    dropdownIndicator: () =>
        "px-2 text-base-content/70",

    indicatorSeparator: () =>
        "hidden",
};

type Props = {
    options: { value: number; label: string }[];
    value: any;
    onChange: (val: any) => void;
    placeholder?: string;
};

export default function DaisySelect({
    options,
    value,
    onChange,
    placeholder,
}: Props) {
    return (
        <Select
            unstyled
            isSearchable
            options={options}
            value={value}
            onChange={onChange}
            placeholder={placeholder}
            classNames={daisySelectStyles}
        />
    );
}