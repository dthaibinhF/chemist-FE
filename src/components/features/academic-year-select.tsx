import { useAcademicYear } from '@/hooks/useAcademicYear';
import { useEffect, useState } from 'react';
import { Select, SelectContent, SelectGroup, SelectItem, SelectLabel, SelectTrigger, SelectValue } from '../ui/select';

interface AcademicYearSelectProps {
    handleSelect: (value: string) => void;
    value?: string;
}

export const AcademicYearSelect = ({ handleSelect, value }: AcademicYearSelectProps) => {
    const { academicYears, handleFetchAcademicYears } = useAcademicYear();
    const [selectedValue, setSelectedValue] = useState<string>('');

    useEffect(() => {
        const load = () => {
            if (academicYears.length === 0) {
                handleFetchAcademicYears();
            }
        }
        load();
    }, [academicYears, handleFetchAcademicYears]);

    useEffect(() => {
        const initialValue = value
            ? academicYears.find(ay => ay.id?.toString() === value)?.id?.toString()
            : getDefaultAcademicYear();

        if (initialValue) {
            setSelectedValue(initialValue);
            handleSelect(initialValue);
        }
    }, [value, academicYears]);

    const getDefaultAcademicYear = () => {
        const currentDate = new Date();

        const academicYear = academicYears.find(ay => {
            const [startYear] = ay.year.split('-').map(Number);
            const startDate = new Date(startYear, 4, 9); // May 9th (month is 0-indexed)
            const endDate = new Date(startYear + 1, 4, 9); // May 9th of next year

            return currentDate >= startDate && currentDate < endDate;
        });
        return academicYear?.id?.toString() ?? '';
    };

    const handleChange = (value: string) => {
        setSelectedValue(value);
        handleSelect(value);
    };

    return <Select
        value={selectedValue}
        onValueChange={handleChange}>
        <SelectTrigger className='w-full'>
            <SelectValue placeholder="Chọn năm học" />
        </SelectTrigger>
        <SelectContent>
            <SelectGroup>
                <SelectLabel>danh sách năm học</SelectLabel>
                {academicYears.map((academicYear) => (
                    <SelectItem key={academicYear.id} value={academicYear?.id?.toString() ?? ''}>{academicYear.year}</SelectItem>
                ))
                }
            </SelectGroup>
        </SelectContent>
    </Select>
};

export default AcademicYearSelect;