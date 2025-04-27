// ... existing code ...
    // Check for all institutions
    const allInstitutions = await prisma.institution.findMany({
      orderBy: {
        createdAt: 'desc'
      },
      take: 10
    });
    console.log('Recent institutions:');
    allInstitutions.forEach(inst => {
      console.log(`- ${inst.name} (${inst.type}, created: ${inst.createdAt})`);
    });
// ... existing code ...