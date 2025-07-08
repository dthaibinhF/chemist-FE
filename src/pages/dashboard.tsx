import { createEmptyApplication } from '@/components/file-view-and-picker/localstorage';
import { IApplicationPreview } from '@/components/file-view-and-picker/media';
import UploadAndViewFile from '@/components/file-view-and-picker/upload-and-view-file';
import { Form, FormField, FormItem, FormMessage } from '@/components/ui/form';
import { usePageTitle } from '@/hooks/usePageTitle';
import { zodResolver } from '@hookform/resolvers/zod';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod/v4';

export interface IStudentDocumentsPreview {
  portraitPhotoUrls: { url: string; fileName: string }[];
  admissionLetterUrls: { url: string; fileName: string }[];
  grade12TranscriptUrls: { url: string; fileName: string }[];
  topAcademicAwardCertificateUrls: { url: string; fileName: string }[];
  letterUrls: { url: string; fileName: string }[];
  povertyCertificateUrls: { url: string; fileName: string }[];
  foreignLanguageCertificateUrls: { url: string; fileName: string }[];
}

type Item = {
  id: number;
  title: string;
  example: string;
  description: string;
  isRequired: boolean;
  maxFiles: number; // Số file tối đa cho phép
  maxSize: number; // Kích thước tối đa cho phép
  documentField: keyof IStudentDocumentsPreview; // Field tương ứng trong IStudentDocuments
};

const items: Item[] = [
  {
    id: 1,
    title: 'Ảnh chân dung sinh viên (6 tháng gần nhất - hình ảnh nghiêm túc, thấy rõ mặt):',
    example: 'Ví dụ: Nguyễn Văn A-Chân dung',
    description: 'Tải 1 tệp được hỗ trợ lên: PDF hoặc image. Kích thước tối đa 100 MB.',
    isRequired: true,
    maxSize: 100, // MB
    maxFiles: 1,
    documentField: 'portraitPhotoUrls',
  },
  {
    id: 2,
    title:
      'Giấy báo nhập học của trường có thể hiện điểm thi/ kết quả xét tuyển theo một trong các phương thức trên (scan file đính kèm):',
    example: 'Ví dụ: Nguyễn Văn A-Giấy báo nhập học.',
    description:
      'Tải tối đa 5 tệp được hỗ trợ lên: PDF hoặc image. Mỗi tệp có kích thước tối đa 10 MB.',
    isRequired: true,
    maxFiles: 5,
    documentField: 'admissionLetterUrls',
    maxSize: 10, // MB
  },
  {
    id: 3,
    title: 'Bảng điểm học bạ lớp 12 (scan đính kèm - chỉ scan 1 trang bảng điểm lớp 12):',
    example: 'Ví dụ: Nguyễn Văn A-Bảng điểm.',
    description:
      'Tải tối đa 10 tệp được hỗ trợ lên: PDF hoặc image. Mỗi tệp có kích thước tối đa 10 MB.',
    isRequired: true,
    maxFiles: 10,
    documentField: 'grade12TranscriptUrls',
    maxSize: 10, // MB
  },
  {
    id: 4,
    title: 'Giấy chứng nhận giải thưởng học tập cao nhất (nếu có):',
    example: 'Ví dụ: Nguyễn Văn A-GCN giải thưởng.',
    description:
      'Tải tối đa 10 tệp được hỗ trợ lên: PDF hoặc image. Mỗi tệp có kích thước tối đa 10 MB.',
    isRequired: false,
    maxFiles: 10,
    documentField: 'topAcademicAwardCertificateUrls',
    maxSize: 10, // MB
  },
  {
    id: 5,
    title: 'Thư giới thiệu của giáo viên dạy THPT (nếu có):',
    example: 'Ví dụ: Nguyễn Văn A-Thư giới thiệu.',
    description:
      'Tải tối đa 5 tệp được hỗ trợ lên: PDF hoặc image. Mỗi tệp có kích thước tối đa 10 MB.',
    isRequired: false,
    maxFiles: 5,
    documentField: 'letterUrls',
    maxSize: 10, // MB
  },
  {
    id: 6,
    title: 'Giấy Chứng Nhận Hộ Nghèo/ Hộ Cận Nghèo hay Giấy xác nhận hoàn cảnh khó khăn (nếu có):',
    example: 'Ví dụ: Nguyễn Văn A-Giấy chứng nhận hộ nghèo',
    description:
      'Tải tối đa 5 tệp được hỗ trợ lên: PDF hoặc image. Mỗi tệp có kích thước tối đa 10 MB.',
    isRequired: false,
    maxFiles: 5,
    documentField: 'povertyCertificateUrls',
    maxSize: 10, // MB
  },
  {
    id: 7,
    title: 'Giấy Chứng Nhận Ngoại Ngữ (nếu có):',
    example: 'Ví dụ: Nguyễn Văn A-Giấy chứng nhận ngoại ngữ',
    maxFiles: 1,
    description:
      `Tải tối đa 1 tệp được hỗ trợ lên: PDF hoặc image. Mỗi tệp có kích thước tối đa 10 MB.`,
    isRequired: false,
    documentField: 'foreignLanguageCertificateUrls',
    maxSize: 10, // MB
  },
];

const schema = z.object({
  portraitPhotoUrls: z.array(
    z.object({
      url: z.string(),
      fileName: z.string(),
    })
  ),
  admissionLetterUrls: z.array(
    z.object({
      url: z.string(),
      fileName: z.string(),
    })
  ),
  grade12TranscriptUrls: z.array(
    z.object({
      url: z.string(),
      fileName: z.string(),
    })
  ),
  topAcademicAwardCertificateUrls: z
    .array(
      z.object({
        url: z.string(),
        fileName: z.string(),
      })
    )
    .optional(),
  letterUrls: z
    .array(
      z.object({
        url: z.string(),
        fileName: z.string(),
      })
    )
    .optional(),
  povertyCertificateUrls: z
    .array(
      z.object({
        url: z.string(),
        fileName: z.string(),
      })
    )
    .optional(),
  foreignLanguageCertificateUrls: z
    .array(
      z.object({
        url: z.string(),
        fileName: z.string(),
      })
    )
    .optional(),
});

const Dashboard = () => {
  usePageTitle('Dashboard');
  const [application, setApplication] = useState<IApplicationPreview | null>(createEmptyApplication());

  const form = useForm<z.infer<typeof schema>>({
    resolver: zodResolver(schema),
    defaultValues: {
      portraitPhotoUrls: application?.documentInfor.portraitPhotoUrls || [],
      admissionLetterUrls: application?.documentInfor.admissionLetterUrls || [],
      grade12TranscriptUrls: application?.documentInfor.grade12TranscriptUrls || [],
      topAcademicAwardCertificateUrls:
        application?.documentInfor.topAcademicAwardCertificateUrls || [],
      letterUrls: application?.documentInfor.letterUrls || [],
      povertyCertificateUrls: application?.documentInfor.povertyCertificateUrls || [],
      foreignLanguageCertificateUrls:
        application?.documentInfor.foreignLanguageCertificateUrls || [],
    },
  });


  const handleSave = () => {
    const updatedApplication = {
      ...application,
      documentInfor: {
        ...application?.documentInfor,
        portraitPhotoUrls: form.getValues('portraitPhotoUrls'),
        admissionLetterUrls: form.getValues('admissionLetterUrls'),
        grade12TranscriptUrls: form.getValues('grade12TranscriptUrls'),
        topAcademicAwardCertificateUrls: form.getValues('topAcademicAwardCertificateUrls'),
        letterUrls: form.getValues('letterUrls'),
        povertyCertificateUrls: form.getValues('povertyCertificateUrls'),
        foreignLanguageCertificateUrls: form.getValues('foreignLanguageCertificateUrls'),
      }
    } as IApplicationPreview;
    setApplication(updatedApplication)
  }

  return (
    <div className="space-y-4">
      {/* <Button onClick={() => console.log(application?.documentInfor)}>Click to see application</Button>
      <Button onClick={() => console.log(form.watch())}>coi form watch</Button> */}
      <Form {...form}>
        <form
          onBlur={handleSave}
          onSubmit={form.handleSubmit(handleSave)}
          id="student-documents-form"
        >
          {items.map(item => (
            <FormField
              key={item.id}
              control={form.control}
              name={item.documentField}
              render={({ field }) => (
                <FormItem className="mb-5 space-y-2 rounded-[16px] bg-[#f4f4f5] p-8">
                  <div>
                    <h3 className="text-gray-800">
                      {item.title} {item.isRequired && <span className="text-red-500">*</span>}
                    </h3>
                    <p>{item.example}</p>
                  </div>
                  <p className="text-gray-500">{item.description}</p>
                  <UploadAndViewFile
                    maxFileSize={item.maxFiles * 1024 * 1024}
                    multiple={item.maxFiles > 1 ? true : false}
                    media={field.value}
                    onMediaChange={field.onChange}
                  />
                  <FormMessage />
                </FormItem>
              )}
            />
          ))}
        </form>
      </Form>
    </div>
  );
};

export default Dashboard;
