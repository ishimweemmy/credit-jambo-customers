export const GrpcServices = {
  STUDENT_SERVICE: 'StudentService',
  COLLEGE_SERVICE: 'CollegeIntegrationService',
  INDUSTRIAL_ATTACHMENT_SERVICE: 'IndustrialAttachmentService',
  COMPANY_SERVICE: 'CompanyIntegrationService',
  HOCUS_POCUS_SERVICE: 'HocusPocusService',
  LECTURE_SERVICE: 'TeacherService',
  USER_INTEGRATION_SERVICE: 'UserIntegrationService',
  USER_SERVICE: 'UserService',
  MODULE_SERVICE: 'AcademicModuleService',
  DEPARTMENT_SERVICE: 'DepartmentService',
  ACADEMIC_YEAR_SERVICE: 'AcademicYearService',
};

export const StudentGrpcMethods = {
  FIND_STUDENT: 'FindStudentByEmailAndRegistationNumber',
  FIND_STUDENT_BY_REGISTRATION_NUMBER: 'FindStudentByRegistrationNumber',
  FIND_STUDENT_MARKS: 'FindStudentMarksByRegistationNumber',
  FIND_GRADUATE_BY_REGISTRATION_NUMBER: 'FindGraduateByRegstrationNumber',
};

export const TeacherGrpcMethods = {
  FIND_LECTURE: 'FindStudent',
  FIND_LECTURE_BY_CODE_OR_EMAIL: 'FindTeacher',
  FIND_HOD: 'FindHod',
};

export const CollegeGrpcMethods = {
  FIND_COLLEGE: 'FindCollege',
  FIND_ALL_COLLEGES: 'FindAllColleges',
  FIND_COLLEGE_MODULES: 'FindCollegeModules',
  FIND_COLLEGE_MODULES_BY_DEPARTMENT: 'FindCollegeModulesByDepartment',
};

export const ModuleGrpcMethods = {
  FIND_ALL: 'FindAll',
};

export const UserGrpcMethods = {
  FIND_ALL_USERS: 'FindAllUsers',
};

export const IndustrialAttachmentMethods = {
  FIND_ALL_BY_STUDENT: 'FindAllByStudent',
};
export const CompanyGrpcMethods = {
  FIND_COMPANY: 'FindCompany',
  FIND_ALL_COMPANIES: 'FindAllCompanies',
};

export const DepartmentGrpcMethods = {
  FIND_DEPARTMENT: 'FindDepartment',
  FIND_ALL_DEPARTMENTS: 'FindAllDepartments',
};

export const HocusPocusServiceGrpcMethods = {
  LOAD_DOCUMENT: 'LoadDocument',
  STORE_DOCUMENT: 'StoreDocument',
};

export const AcademicYearGrpcMethods = {
  FIND_CURRENT_ACADEMIC_YEAR: 'FindCurrentAcademicYear',
};
