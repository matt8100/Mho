export class TTBPayload {
  campuses: string[]
  courseCodeAndTitleProps: {
    courseCode: string
    courseTitle: string
    courseSectionCode: string
    searchCourseDescription: boolean
  }
  courseLevels: string[]
  creditWeights: string[]
  dayPreferences: string[]
  deliveryModes: string[]
  departmentProps: string[]
  direction: string
  divisions: string[]
  instructor: string
  page: number
  pageSize: number
  requirementProps: string[]
  sessions: string[]
  timePreferences: string[]
  
  constructor(courseTitle: string, courseSectionCode: string) {
    this.campuses = []
    this.courseCodeAndTitleProps = {
      courseCode: '',
      courseTitle,
      courseSectionCode,
      searchCourseDescription: true
    }
    this.courseLevels = []
    this.creditWeights = []
    this.dayPreferences = []
    this.deliveryModes = []
    this.departmentProps = []
    this.direction = 'asc'
    this.divisions = ['APSC', 'ARTSC']
    this.instructor = ''
    this.page = 1
    this.pageSize = 10
    this.requirementProps = []
    this.sessions = ['20229', '20231', '20229-20231']
    this.timePreferences = []
  }
}

export interface TTBResponse {
  payload: {
    pageableCourse: {
      courses: [{
        cmCourseInfo: {
          corequisitesText: string
          description: string
          exclusionsText: string
          prerequisitesText: string
          recommendedPreparation: string
        },
        code: string
        faculty: {
          code: string
          name: string
        },
        name: string
        sectionCode: string
      }]
    }
  }
}

export interface TTBCourseInfo {
  code: string
  sectionCode: string
  name: string
  description: string
  faculty: string
  prerequisites: string
  recommendedPrep: string
  corequisites: string
  exclusions: string
}