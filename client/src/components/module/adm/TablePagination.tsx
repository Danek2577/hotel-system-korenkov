import { observer } from "mobx-react-lite";
import React, { JSX, useEffect, useState } from "react";
import Auth from "../../../store/AuthStore";
import toast from "react-hot-toast";
import {
    Button,
    Checkbox,
    Input,
    Link,
    Pagination,
    Select,
    SelectItem,
    Spinner,
    Table,
    TableBody,
    TableCell,
    TableColumn,
    TableHeader,
    TableRow
} from "@nextui-org/react";
import { formatDate, formatPrice } from "../../../utils/dateUtils";
import useDebounce from "../../../hooks/useDebounce";

// Column Types
type TableColumnBase = {
    header: string;
};

type TableColumnText = TableColumnBase & {
    text: string;
};

type TableColumnLink = TableColumnBase & {
    link: {
        startPath?: string;
        valueNamePath: string;
        valueNameTitle?: string;
        isBlank?: boolean;
        endPath?: string;
        title?: string;
    };
};

type TableColumnCustom = TableColumnBase & {
    custom: {
        func: (row: any) => JSX.Element | string;
    };
};

type TableColumnTimestamp = TableColumnBase & {
    timestamp: {
        valueName: string;
        isLong?: boolean;
    };
};

type TableColumnPrice = TableColumnBase & {
    price: {
        valueName: string;
    };
};

type TableColumnButton = TableColumnBase & {
    button: {
        title: string;
        color?: 'primary' | 'danger' | 'warning' | 'success' | 'default';
        onClick: (row: any) => void;
    };
};

type TableColumnCommon =
    | TableColumnText
    | TableColumnLink
    | TableColumnCustom
    | TableColumnTimestamp
    | TableColumnPrice
    | TableColumnButton;

// Input Types
type InputSelect = {
    options: {
        value: string | number;
        label: string;
    }[];
};

type TInputItem = {
    name: string;
    label: string;
    type?: 'text' | 'number' | 'select';
    placeholder?: string;
    checkbox?: boolean;
    select?: InputSelect;
};

// Request/Response Types
export type TRequestParams = {
    offset?: number;
    limit?: number;
} & {
    [key: string]: string | number | undefined;
};

export type TResponseData<RowsType extends object> = {
    message: {
        count: number;
    } & {
        [key: string]: any;
    };
};

type Row<T = Record<string, any>> = {
    id: number;
} & T;

// Props
type TablePaginationProps<T extends object> = {
    request: (params: TRequestParams) => Promise<TResponseData<T>>;
    rowsName: string;
    inputs?: TInputItem[];
    table: TableColumnCommon[];
    leftContent?: JSX.Element;
    isShowCount?: boolean;
    limit?: number;
};

function TablePagination<T extends object>({
    request,
    rowsName,
    table = [],
    inputs = [],
    leftContent,
    isShowCount = true,
    limit: defaultLimit = 10
}: TablePaginationProps<T>) {
    const [limit] = useState(defaultLimit);
    const [inputsValue, setInputsValue] = useState<Record<string, any>>(
        (inputs || []).reduce((acc, cur) => ({ ...acc, [cur.name]: '' }), {})
    );
    const [rows, setRows] = useState<Row<T>[]>([]);
    const [offset, setOffset] = useState(0);
    const [count, setCount] = useState(0);
    const [isLoad, setIsLoad] = useState(true);
    const inputsValueDebounce = useDebounce(inputsValue, 500);

    const loadRequest = async () => {
        setIsLoad(true);
        try {
            const filteredInputsValue = Object.keys(inputsValueDebounce).reduce((acc: Record<string, any>, key) => {
                if (inputsValueDebounce[key] !== '' && inputsValueDebounce[key] !== undefined) {
                    acc[key] = inputsValueDebounce[key];
                }
                return acc;
            }, {});

            const { message: data } = await request({ offset, limit, ...filteredInputsValue });
            setRows((data[rowsName] || []) as Row<T>[]);
            setCount(data.count || 0);
        } catch (e: any) {
            toast.error(e?.response?.data?.message || "Ошибка загрузки");
        }
        setIsLoad(false);
    };

    useEffect(() => {
        if (!Auth.isAuth) return;
        loadRequest();
    }, [Auth.isAuth, offset, inputsValueDebounce, limit]);

    useEffect(() => {
        setOffset(0);
    }, [inputsValueDebounce, limit]);

    const totalPages = Math.ceil(count / limit);

    const handleInputChange = (name: string, value: any) => {
        setInputsValue(prev => ({ ...prev, [name]: value }));
    };

    const renderCell = (row: Row<T>, column: TableColumnCommon) => {
        if ('text' in column) {
            return (row as any)[column.text];
        }

        if ('custom' in column) {
            return column.custom.func(row);
        }

        if ('timestamp' in column) {
            const value = (row as any)[column.timestamp.valueName];
            return formatDate(value);
        }

        if ('price' in column) {
            const value = (row as any)[column.price.valueName];
            return formatPrice(value);
        }

        if ('link' in column) {
            const path = `${column.link.startPath || ''}${(row as any)[column.link.valueNamePath]}${column.link.endPath || ''}`;
            const title = column.link.valueNameTitle
                ? (row as any)[column.link.valueNameTitle]
                : column.link.title || 'Перейти';
            return (
                <Link href={path} target={column.link.isBlank ? '_blank' : undefined}>
                    {title}
                </Link>
            );
        }

        if ('button' in column) {
            return (
                <Button
                    size="sm"
                    variant="flat"
                    color={column.button.color || 'primary'}
                    onPress={() => column.button.onClick(row)}
                >
                    {column.button.title}
                </Button>
            );
        }

        return null;
    };

    return (
        <div className="space-y-4">
            {/* Filters */}
            {(inputs.length > 0 || leftContent) && (
                <div className="flex flex-wrap justify-between items-center gap-4 p-4 border-b border-divider">
                    <div className="flex flex-wrap items-center gap-3">
                        {inputs.map((input) => {
                            if (input.select) {
                                return (
                                    <Select
                                        key={input.name}
                                        placeholder={input.label}
                                        selectedKeys={inputsValue[input.name] ? [inputsValue[input.name]] : []}
                                        onSelectionChange={(keys) => {
                                            handleInputChange(input.name, Array.from(keys)[0] as string || '');
                                        }}
                                        classNames={{
                                            base: "w-44",
                                            trigger: "h-10 min-h-10 bg-content2 hover:bg-content3"
                                        }}
                                    >
                                        {[
                                            <SelectItem key="" value="">Все</SelectItem>,
                                            ...input.select.options.map((opt) => (
                                                <SelectItem key={String(opt.value)} value={String(opt.value)}>
                                                    {opt.label}
                                                </SelectItem>
                                            ))
                                        ]}
                                    </Select>
                                );
                            }

                            if (input.checkbox) {
                                return (
                                    <Checkbox
                                        key={input.name}
                                        isSelected={!!inputsValue[input.name]}
                                        onValueChange={(checked) => handleInputChange(input.name, checked)}
                                    >
                                        {input.label}
                                    </Checkbox>
                                );
                            }

                            return (
                                <Input
                                    key={input.name}
                                    placeholder={input.label}
                                    value={inputsValue[input.name] || ''}
                                    onValueChange={(value) => handleInputChange(input.name, value)}
                                    type={input.type || 'text'}
                                    startContent={
                                        <svg className="w-4 h-4 text-default-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                                        </svg>
                                    }
                                    classNames={{
                                        base: "w-52",
                                        input: "bg-transparent",
                                        inputWrapper: "h-10 min-h-10 bg-content2 hover:bg-content3 group-data-[focus=true]:bg-content3"
                                    }}
                                />
                            );
                        })}

                        {/* Clear filters button */}
                        {Object.values(inputsValue).some(v => v !== '' && v !== false) && (
                            <Button
                                isIconOnly
                                variant="light"
                                size="sm"
                                onPress={() => {
                                    setInputsValue(
                                        inputs.reduce((acc, cur) => ({ ...acc, [cur.name]: '' }), {})
                                    );
                                }}
                                className="text-default-400 hover:text-danger"
                            >
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </Button>
                        )}
                    </div>

                    {leftContent}
                </div>
            )}

            {/* Count */}
            {isShowCount && count > 0 && (
                <div className="px-4 text-sm text-default-500">
                    Найдено: {count}
                </div>
            )}

            {/* Table */}
            <Table
                aria-label="Data table"
                classNames={{
                    base: "max-h-[520px] overflow-auto",
                    table: "min-h-[100px]",
                    th: "bg-content2 text-default-600",
                    td: "py-3"
                }}
            >
                <TableHeader>
                    {table.map((col, idx) => (
                        <TableColumn key={idx}>{col.header}</TableColumn>
                    ))}
                </TableHeader>
                <TableBody
                    items={rows}
                    isLoading={isLoad}
                    loadingContent={<Spinner label="Загрузка..." />}
                    emptyContent="Нет данных"
                >
                    {(row) => (
                        <TableRow key={row.id}>
                            {table.map((col, idx) => (
                                <TableCell key={idx}>{renderCell(row, col)}</TableCell>
                            ))}
                        </TableRow>
                    )}
                </TableBody>
            </Table>

            {/* Pagination */}
            {totalPages > 1 && (
                <div className="flex justify-center p-4">
                    <Pagination
                        total={totalPages}
                        page={Math.floor(offset / limit) + 1}
                        onChange={(page) => setOffset((page - 1) * limit)}
                        color="primary"
                        showControls
                    />
                </div>
            )}
        </div>
    );
}

export default observer(TablePagination);
