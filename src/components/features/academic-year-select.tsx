import { useAcademicYear } from '@/hooks/useAcademicYear';
import { Select, SelectContent, SelectGroup, SelectItem, SelectLabel, SelectTrigger, SelectValue } from '../ui/select';
import { useEffect } from 'react';

interface AcademicYearSelectProps {
    handleSelect: (value: string) => void;
}

export const AcademicYearSelect = ({ handleSelect }: AcademicYearSelectProps) => {
    const { academicYears, handleFetchAcademicYears } = useAcademicYear();

    useEffect(() => {
        const load = () => {
            if (academicYears.length === 0) {
                handleFetchAcademicYears();
            }
        }
        load();
        handleSelect(getDefaultAcademicYear());
    }, [academicYears, handleFetchAcademicYears])

    const getDefaultAcademicYear = () => {
        const currentDate = new Date();

        const academicYear = academicYears.find(ay => {
            const [startYear] = ay.year.split('-').map(Number);
            const startDate = new Date(startYear, 4, 9); // May 9th (month is 0-indexed)
            const endDate = new Date(startYear + 1, 4, 9); // May 9th of next year

            return currentDate >= startDate && currentDate < endDate;
        });
        const defaultAcademicYear = academicYear?.id?.toString() ?? '';
        return defaultAcademicYear;
    };

    return <Select
        defaultValue={getDefaultAcademicYear()}
        onValueChange={(value) => handleSelect(value)}>
        <SelectTrigger>
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