import { IApplicationPreview } from "./media";

const APPLICATION_STORAGE_KEY = 'vsdp_application_data';

const initialApplication: IApplicationPreview = {
  studentInfor: {
    fullName: '',
    gender: false,
    dateOfBirth: '',
    email: '',
    emailStudent: '',
    hometownProvince: '',
    citizenIdNumber: '',
    phoneNumber: '',
    permanentAddress: '',
    permanentProvinceCity: '',
    temporaryAddress: '',
    major: '',
    className: '',
    studentCode: '',
    isPartTimeJob: false,
    partTimeJob: '',
    partTimeIncome: 0,
    universityId: '',
  },
  academicInfor: {
    admissionMethod: '',
    nationalExamTotalScore: 0,
    highSchoolExamTotalScore: 0,
    abilityTestTotalScoreHCM: 0,
    abilityTestTotalScoreHN: 0,
    totalScoreOfSubjectsInCombination: 0,
    totalScoreOfSpecialGraduationAdmissionScore: 0,
    totalScoreOfVsat: 0,
    averageScoreGrade10: 0,
    averageScoreGrade11: 0,
    averageScoreGrade12: 0,
    awardHaveEarn: '',
    highestLevelAward: '',
    scholarshipHaveReceived: '',
    isHaveReferenceFromTeacher: false,
  },
  familyInfor: {
    parentsCurrentAddress: '',
    parentsMaritalStatus: '',
    povertyCertificate: '',
    divorcedParentSupport: false,
    otherMemberDescription: '',
    numberOfGrandparentLivingWith: 0,
    numberOfSiblingMarried: 0,
    numberOfUnmarriedSibling: 0,
    numberOfUnmarriedSiblingInEducate: 0,
    numberOfUnmarriedSiblingNotInEducateOrDoSmallJob: 0,
    numberOfUnmarriedSiblingInSpecificJob: 0,
    totalSiblingFromOtherField: 0,
    momName: '',
    momYob: 0,
    momHealthStatus: '',
    momHealthDescription: '',
    momJobTitle: '',
    momEducationLevel: '',
    momIncome: 0,
    dadName: '',
    dadYob: 0,
    dadHealthStatus: '',
    dadHealthDescription: '',
    dadJobTitle: '',
    dadEducationLevel: '',
    dadIncome: 0,
  },
  essayInfor: {
    essayContentFirst: '',
    essayContentSecond: '',
  },
  documentInfor: {
    portraitPhotoUrls: [],
    admissionLetterUrls: [],
    grade12TranscriptUrls: [],
    topAcademicAwardCertificateUrls: [],
    letterUrls: [],
    povertyCertificateUrls: [],
    foreignLanguageCertificateUrls: [],
  },
};

/**
 * Creates an empty application with default values
 * @returns A new application object with default values
 */
export const createEmptyApplication = (): IApplicationPreview => {
  return {
    ...initialApplication,
  };
};

/**
 * Saves application data to localStorage
 * @param application The application data to save
 */
export const saveApplicationToLocalStorage = (application: IApplicationPreview): void => {
  try {
    localStorage.setItem(APPLICATION_STORAGE_KEY, JSON.stringify(application));
  } catch (error) {
    console.error('Error saving application to localStorage:', error);
  }
};

/**
 * Retrieves application data from localStorage
 * @returns The stored application data or null if not found
 */
export const getApplicationFromLocalStorage = (): IApplicationPreview | null => {
  try {
    const storedData = localStorage.getItem(APPLICATION_STORAGE_KEY);
    if (!storedData) return null;

    const parsedData = JSON.parse(storedData) as IApplicationPreview;

    // Convert date strings back to Date objects if they exist
    if (parsedData.studentInfor?.dateOfBirth) {
      parsedData.studentInfor.dateOfBirth = new Date(
        parsedData.studentInfor.dateOfBirth
      ).toISOString();
    }

    return parsedData;
  } catch (error) {
    console.error('Error retrieving application from localStorage:', error);
    return null;
  }
};

/**
 * Removes application data from localStorage
 */
export const clearApplicationFromLocalStorage = (): void => {
  try {
    localStorage.setItem(APPLICATION_STORAGE_KEY, JSON.stringify(initialApplication));
  } catch (error) {
    console.error('Error clearing application from localStorage:', error);
  }
};

export const clearFileApplicationFromLocalStorage = (): void => {
  const storedData = localStorage.getItem(APPLICATION_STORAGE_KEY);
  if (!storedData) return;
  const jsonData = JSON.parse(storedData) as IApplicationPreview;
  jsonData.documentInfor = {
    portraitPhotoUrls: [],
    admissionLetterUrls: [],
    grade12TranscriptUrls: [],
    topAcademicAwardCertificateUrls: [],
    letterUrls: [],
    povertyCertificateUrls: [],
    foreignLanguageCertificateUrls: [],
  };
  saveApplicationToLocalStorage(jsonData);
};
